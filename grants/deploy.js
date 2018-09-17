const fs = require("fs")
const awsCreds = JSON.parse(fs.readFileSync("aws.json").toString().trim())
//https://github.com/andrewrk/node-s3-client
var s3 = require('s3');

var client = s3.createClient({
  s3Options: awsCreds,
});

var params = {
  localDir: "build",

  s3Params: {
    Bucket: "ethgrants.com",
    Prefix: "",
    ACL: "public-read"
    // other options supported by putObject, except Body and ContentLength.
    // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
  },
};

var uploader = client.uploadDir(params);
uploader.on('error', function(err) {
  console.error("unable to sync:", err.stack);
});
uploader.on('progress', function() {
  console.log("progress", uploader.progressAmount, uploader.progressTotal);
});
uploader.on('end', function() {
  console.log("done uploading");
});
