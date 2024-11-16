import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { Feather } from "@expo/vector-icons";
import CleansInProgressCard from "../../components/CleansInProgressCard";
import RecentlyViewedBuildingCard from "../../components/RecentlyViewedBuildingCard";
import ViewBuildingCard from "../../components/ViewBuildingCard";
import styles from "./styles";
import { buildingListActions } from "../../store/building-slice";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { firebaseApp } from "../../firebase/config";

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const db = getFirestore(firebaseApp);
  const accountsAccess = useSelector(
    (state) => state.buildingList.allBuildings
  );

  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredList, setFilteredList] = useState([]);
  const [searchedBuilding, setSearchedBuilding] = useState("");

  useEffect(() => {
    if (!accountsAccess.length) {
      setLoading(false);
      return;
    }
    setAllBuildings();
  }, [accountsAccess?.length]);

  useEffect(() => {
    if (searchedBuilding) {
      filterList();
    } else {
      setFilteredList([]);
    }
  }, [searchedBuilding]);

  const setAllBuildings = async () => {
    try {
      const promises = accountsAccess.map(async (account) => {
        const accountPromises = account.sites.map(async (site) => {
          const hasDropmarking = await siteHasDropmarking(site.site_id);
          if (hasDropmarking) {
            const img = await getBuildingImage(site.site_id);
            return {
              accountName: account.account_name,
              buildingImage: img,
              ...site,
            };
          }
          return null;
        });
        const buildings = await Promise.all(accountPromises);
        return buildings.filter((building) => building !== null);
      });

      const buildingsArray = (await Promise.all(promises)).flat();

      setBuildings(buildingsArray);
      setLoading(false);
    } catch (error) {
      console.log(error);
      // If fetch fails, try retrieving data from the cache
      if (navigator.serviceWorker.controller) {
        const messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = (event) => {
            const cachedData = event.data;
            // Use cached data to update the state
            setBuildings(cachedData);
            setLoading(false);
        };
        navigator.serviceWorker.controller.postMessage({ type: 'GET_CACHED_BUILDINGS' }, [messageChannel.port2]);
    }
      // setLoading(false);
    }
  };

  const siteHasDropmarking = async (siteId) => {
    try {
      const siteRef = doc(db, "BuildingsX", siteId);
      const siteData = await getDoc(siteRef);

      if (!siteData.exists()) {
        throw new Error("No data was found.");
      }
      return siteData.data().has_dropmarking;
    } catch (error) {
      console.log(error);
    }
  };

  const getBuildingImage = async (siteId) => {
    try {
      const buildingPrivateDocRef = doc(
        db,
        "BuildingsX",
        siteId,
        "private_data",
        "private"
      );
      const buildingPrivateData = await getDoc(buildingPrivateDocRef);

      if (!buildingPrivateData.exists()) {
        throw new Error("No data was found.");
      }
      return buildingPrivateData.data().buildingImage;
    } catch (error) {
      console.log(error);
    }
  };

  const buildingHandler = (building) => {
    dispatch(buildingListActions.setSelectedBuilding({ name: building }));
    navigation.navigate("Category");
  };

  const filterList = () => {
    const buildingsClone = [...buildings];
    const filtered = buildingsClone.filter((building) =>
      building.site_name.toLowerCase().includes(searchedBuilding.toLowerCase())
    );
    setFilteredList(filtered);
  };

  if (loading)
    return (
      <ActivityIndicator style={{ flex: 1 }} size="large" color="#5e99fa" />
    );

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <TextInput
          placeholder="Search"
          style={styles.searchInput}
          placeholderTextColor="white"
          onChangeText={setSearchedBuilding}
        />
        <TouchableOpacity>
          <Feather name="search" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* <CleansInProgressCard />

        <View style={styles.recentlyViewBox}>
          <Text style={styles.recentlyViewText}>Recently Viewed</Text>
          <FlatList
            data={buildings}
            renderItem={({ item }) => (
              <RecentlyViewedBuildingCard name={item.site_name} buildingImage={item.buildingImage} goToBuilding={() => buildingHandler(item.site_id)} />
            )}
            keyExtractor={(item, index) => `${item.site_id}-${index}`}
            horizontal
          />
        </View> */}

        <View style={styles.allBuildingsBox}>
          <Text style={styles.recentlyViewText}>All Buildings</Text>
          {!!searchedBuilding ? (
            filteredList.length ? (
              filteredList.map((item, index) => {
                return (
                  <ViewBuildingCard
                    key={index}
                    contractName={item.accountName}
                    buildingName={item.site_name}
                    buildingImage={item.buildingImage}
                    goToBuilding={() => buildingHandler(item.site_id)}
                  />
                );
              })
            ) : (
              <Text style={styles.footerText}>No buildings found</Text>
            )
          ) : (
            buildings.map((item, index) => {
              return (
                <ViewBuildingCard
                  key={index}
                  contractName={item.accountName}
                  buildingName={item.site_name}
                  buildingImage={item.buildingImage}
                  goToBuilding={() => buildingHandler(item.site_id)}
                />
              );
            })
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Principle WC</Text>
        </View>
      </ScrollView>
    </View>
  );
}
