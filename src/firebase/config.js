import { initializeApp } from "firebase/app";

import { isInProductionEnvironment } from "../utils/helpers/environment";

const firebaseConfig = isInProductionEnvironment()
  ? {
      apiKey: "",
      authDomain: "test-334f2.firebaseapp.com",
      databaseURL: "https://test-334f2-default-rtdb.firebaseio.com",
      projectId: "test-334f2",
      storageBucket: "test-334f2.appspot.com",
      messagingSenderId: "9",
      appId: "",
      measurementId: "",
    }
  : {
      apiKey: "",
      authDomain: "pcshub-test.firebaseapp.com",
      projectId: "pcshub-test",
      storageBucket: "pcshub-test.appspot.com",
      messagingSenderId: "7",
      appId: "",
    };

const firebaseApp = initializeApp(firebaseConfig);

export { firebaseApp };
