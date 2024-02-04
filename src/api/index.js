import { arrayRemove, arrayUnion, collection, doc, onSnapshot, orderBy, query, setDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "../config/firebase.config"
import { toast } from "react-toastify";

export const getUserDetail = async () => {
    return new Promise((resolve, reject) => { // Include 'reject' as a parameter
        const unsubscribe = auth.onAuthStateChanged((userCred) => {
            if (userCred) {
                const userData = userCred.providerData[0];
                // console.log(userData);
                const unsubscribeSnapshot = onSnapshot(
                    doc(db, "users", userData?.uid), (_doc) => {
                    if (_doc.exists()) {
                        resolve(_doc.data());
                    } else {
                        setDoc(doc(db, "users", userData?.uid), userData).then(() => {
                            resolve(userData);
                        }).catch((error) => {
                            reject(error); // Use reject here
                        });
                    }
                });

                // Unsubscribe from the listener to prevent memory leakage
                return unsubscribe();
            } else {
                reject(new Error("User is not authenticated"));
            }

            // here it is prevent to memory likege
            unsubscribe();
        });
    });
};

export const getTemplates = () => {
    return new Promise((resolve, reject) => {
        const templateQuery = query(
            collection(db, "templates"),
            orderBy("timestamp", "asc"),
        );
        const unsubscribe = onSnapshot(templateQuery, (querySnap) => {
            const templates = querySnap.docs.map((doc) => doc.data());
            resolve(templates);
        });
        return unsubscribe;
    })
    
}
export const saveToCollections = async (user, data) => {
    if (!user?.collections?.includes(data?._id)) {
      const docRef = doc(db, "users", user?.uid);
  
      await updateDoc(docRef, {
        collections: arrayUnion(data?._id),
      })
        .then(() => toast.success("Saved to Collection"))
        .catch((err) => toast.error(`Error : ${err.message}`));
    } else {
      const docRef = doc(db, "users", user?.uid);
      await updateDoc(docRef, {
        collections: arrayRemove(data?._id),
      })
        .then(() => toast.success("Removed from Collection"))
        .catch((err) => toast.error(`Error : ${err.message}`));
    }
  };
  
  export const saveToFavourites = async (user, data) => {
      if (!data?.favourites?.includes(user?.uid)) {
        const docRef = doc(db, "templates", data?._id);
    
        await updateDoc(docRef, {
          favourites: arrayUnion(user?.uid),
        })
          .then(() => toast.success("Added to Favourites"))
          .catch((err) => toast.error(`Error : ${err.message}`));
      } else {
        const docRef = doc(db, "templates", data?._id);
        await updateDoc(docRef, {
          favourites: arrayRemove(user?.uid),
        })
          .then(() => toast.success("Removed from Favourites"))
          .catch((err) => toast.error(`Error : ${err.message}`));
      }
    };


export const getTemplateDetails = async(templateID) =>{

} 