const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const fs = require("fs");
const UUID = require("uuid-v4");

const gcconfig = {
  projectId: "place-finder-22e42",
  keyFilename: "place-finder.json"
};

const gcs = require("@google-cloud/storage")(gcconfig);

admin.initializeApp({
  credential: admin.credential.cert(require("./place-finder.json"))
});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.storeImage = functions.https.onRequest((request, response) => {
  return cors(request, response, () => {
    if (
      !request.headers.authorization ||
      !request.headers.authorization.startsWith("Bearer")
    ) {
      console.log("No token present");
      response.status(403).json({ error: "Unauthorized" });
      return;
    }
    let idToken;
    // Get the splits right!
    idToken = request.headers.authorization.split(" ")[1];
    admin
      .auth()
      .verifyIdToken(idToken)
      .then(decodedToken => {
        const body = JSON.parse(request.body);
        fs.writeFileSync(
          "/tmp/uploaded-image.jpg",
          body.image,
          "base64",
          err => {
            console.log(err);
            return response.status(500).json({ error: err });
          }
        );
        const bucket = gcs.bucket("place-finder-22e42.appspot.com");
        const uuid = UUID();

        return bucket.upload(
          "/tmp/uploaded-image.jpg",
          {
            uploadType: "media",
            destination: "/places/" + uuid + ".jpg",
            metadata: {
              metadata: {
                contentType: "image/jpeg",
                firebaseStorageDownloadTokens: uuid
              }
            }
          },
          (err, file) => {
            if (!err) {
              console.log(response);
              return response.status(201).json({
                imageUrl:
                  "https://firebasestorage.googleapis.com/v0/b/" +
                  bucket.name +
                  "/o/" +
                  encodeURIComponent(file.name) +
                  "?alt=media&token=" +
                  uuid,
                imagePath: "/places/" + uuid + ".jpg"
              });
            } else {
              console.log(err);
              response.status(500).json({ error: err });
            }
          }
        );
      })
      .catch(error => {
        console.log("Token is invalid!");
        response.status(403).json({error: "Unauthorized"});
      })
  });
});

exports.deleteImage = functions.database.ref("/places/{placeId}").onDelete(event => {
  // const placeData = event.data.previous.val();
  // const placeData = event.val();
  const imagePath = event._data.imagePath

  const bucket = gcs.bucket("place-finder-22e42.appspot.com");
  return bucket.file(imagePath).delete();
});