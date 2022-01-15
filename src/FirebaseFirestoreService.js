import firebase from "firebase";
//import FirebaseAuthService from "./FirebaseAuthService";

const firestore =  firebase.firestore();

const createDocument = (collection, document) => {
    return firestore.collection(collection).add(document);
};

const readDocument = (collection, queries) => {
    let collectionRef = firestore.collection(collection);

    if(queries && queries.length > 0){
        for (const query of queries){
            collectionRef = collectionRef.where(
                query.field,
                query.condition,
                query.value
            );
        }
    }
    return collectionRef.get();
};

const FirebaseFirestoreService = {
    createDocument, readDocument
};

export default FirebaseFirestoreService;