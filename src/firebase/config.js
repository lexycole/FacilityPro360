import { initializeApp } from "firebase/app";

import { isInProductionEnvironment } from "../utils/helpers/environment";

const firebaseConfig = isInProductionEnvironment()
  ? {
      apiKey: "AIzaSyCXxWkaTCerWRXV0hrwnUHKBBPWZDFEwW0",
      authDomain: "test-334f2.firebaseapp.com",
      databaseURL: "https://test-334f2-default-rtdb.firebaseio.com",
      projectId: "test-334f2",
      storageBucket: "test-334f2.appspot.com",
      messagingSenderId: "950098823407",
      appId: "1:950098823407:web:fa1b1e1e75c7396108b31a",
      measurementId: "G-9D7X68FD1G",
    }
  : {
      apiKey: "AIzaSyBLtDLtw52rZnhztpUXBvpkO6WvlwZ2Zww",
      authDomain: "pcshub-test.firebaseapp.com",
      projectId: "pcshub-test",
      storageBucket: "pcshub-test.appspot.com",
      messagingSenderId: "749158443700",
      appId: "1:749158443700:web:f7309fc2fdcc19f066c5e1",
    };

const firebaseApp = initializeApp(firebaseConfig);

export { firebaseApp };
