import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  FlatList,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { firebaseApp } from "../../firebase/config";
import { buildingListActions } from "../../store/building-slice";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  where,
  query,
  orderBy,
  limit,
  getDocs,
  getCountFromServer,
} from "firebase/firestore";
import DatePicker from "react-native-date-picker";
import { SelectList } from "react-native-dropdown-select-list";
import AsyncStorage from '@react-native-async-storage/async-storage';


const QualityControlScreen = ({ navigation }) => {
  const db = getFirestore(firebaseApp);

  const dispatch = useDispatch();
  const selectedBuilding = useSelector(
    (state) => state.buildingList.selectedBuilding
  );
  const buildingRef = collection(db, "BuildingsX");
  const auditColRef = collection(buildingRef, selectedBuilding, "audit");

  const [date, setDate] = useState(new Date());
  const [auditId, setAuditId] = useState(null);
  const [auditFormToComplete, setAuditFormToComplete] = useState(null);
  const [createdAt, setCreatedAt] = useState(new Date());
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [areaBeingAuditted, setAreaBeingAuditted] = useState(null);
  const [scoringOptions, setScoringOptions] = useState([]);
  const [noOfImagesLeftToUpload, setNoOfImagesLeftToUpload] = useState(0);

  useEffect(() => {
    if (selectedBuilding) {
      getAuditFormToComplete();
      setSelectedArea(null);
      setAuditId(null);
      setCreatedAt(new Date());
      setSelectedFloor(null);
      setSelectedArea(null);
      setAreaBeingAuditted(null);
      setScoringOptions([]);
      setNoOfImagesLeftToUpload(0);
    }
  }, [selectedBuilding]);

  const getAuditFormToComplete = async () => {
    try {
    const q = query(auditColRef, orderBy("createdAt", "desc"), limit(1));
    const allAuditFormDocs = await getDocs(q);

    let mostRecentAuditForm;

    allAuditFormDocs.forEach((auditForm) => {
      mostRecentAuditForm = auditForm.data();
    });

    if (mostRecentAuditForm) {
      setAuditId(mostRecentAuditForm.doc_id);
      setAuditFormToComplete(mostRecentAuditForm);
      getScoringOptions(mostRecentAuditForm.itemsScoredOutOf);
    }
    } catch (error) {
    // If fetch fails, try retrieving data from the cache
    // if (navigator.serviceWorker.controller) {
    //     const messageChannel = new MessageChannel();
    //     messageChannel.port1.onmessage = (event) => {
    //         const cachedData = event.data;
    //         // Use cached data
    //     };
    //     navigator.serviceWorker.controller.postMessage({ type: 'GET_CACHED_DATA' }, [messageChannel.port2]);
    // }
}
  };

  const floorOptions = selectedFloor && {
    value: selectedFloor,
    label: selectedFloor,
  };

  const getAreaOptions = () =>
    auditFormToComplete.areas
      .filter(({ floors }) => floors.includes(selectedFloor))
      .map(({ areaName }) => ({ label: areaName, value: areaName }));

  const handleSelectArea = (areaName) => {
    setSelectedArea(areaName);
    saveFormData({ ...auditFormToComplete, selectedArea: areaName });
    const area = auditFormToComplete.areas.find(
      (area) => area.areaName === areaName
    );
    setAreaBeingAuditted({
      areaName: areaName,
      items: area.items.map((item) => ({
        itemName: item,
        imageUrls: [],
        comments: "",
        score: 0,
      })),
    });
  };

  const getScoringOptions = (itemsScoredOutOf) => {
    const arrayRange = (start, stop, step) =>
      Array.from(
        { length: (stop - start) / step + 1 },
        (_, index) => start + index * step
      );

    const scoringOptions = arrayRange(1, itemsScoredOutOf, 1).map((score) => ({
      label: score,
      value: score,
    }));

    setScoringOptions([...scoringOptions, { label: "N/A", value: "N/A" }]);
  };

  const handleFormChange = (field, value) => {
    setAuditFormToComplete((prevForm) => ({
      ...prevForm,
      [field]: value,
    }));
  };

  const handleAuditNextPage = () => {
    if (selectedArea) {
      navigation.navigate("QualityControlWizardForm", {
        selectedArea: selectedArea,
        selectedFloor: selectedFloor,
        auditFormToComplete: auditFormToComplete,
        selectedBuilding: selectedBuilding,
      });
    } else {
      alert("Please select an area or floor before proceeding.");
    }
  };

  // // Function to save form data to AsyncStorage
  // const saveFormData = async (data) => {
  //   try {
  //     await AsyncStorage.setItem('qualityControlFormData', JSON.stringify(data));
  //   } catch (e) {
  //     console.error('Error saving form data', e);
  //   }
  // };

  
  // // Load form data from AsyncStorage on component mount
  // useEffect(() => {
  //   const loadFormData = async () => {
  //     try {
  //       const savedData = await AsyncStorage.getItem('qualityControlFormData');
  //       if (savedData != null) {
  //         const data = JSON.parse(savedData);
  //         setSelectedFloor(data.selectedFloor);
  //         setSelectedArea(data.selectedArea);
  //         // Add other fields as necessary
  //       }
  //     } catch (e) {
  //       console.error('Error loading form data', e);
  //     }
  //   };

  //   loadFormData();
  // }, []);

  // Modify state setters to include saveFormData
  const handleSelectFloor = (val) => {
    setSelectedFloor(val);
    // saveFormData({ ...auditFormToComplete, selectedFloor: val });
  };

  return (
    <ScrollView>
      {auditFormToComplete ? (
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
            Complete Audit
          </Text>

          <Text style={{ marginTop: 16, marginBottom: 8 }}>Floor</Text>

          <SelectList
            setSelected={(val) => setSelectedFloor(val)}
            data={auditFormToComplete.floors}
            save="value"
          />

          <Text style={{ marginTop: 16, marginBottom: 8 }}>Areas</Text>
          {selectedFloor && (
            <SelectList
              setSelected={(val) => setSelectedArea(val)}
              data={getAreaOptions()}
              save="value"
            />
          )}

          <View style={{ marginTop: 30 }}>
            <Button
              title="Next"
              disabled={!selectedArea}
              onPress={handleAuditNextPage}
            />
          </View>
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 16,
          }}
        >
          <Text style={{ fontSize: 20 }}>No audit form available.</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default QualityControlScreen;
