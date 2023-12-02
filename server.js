const dboperations = require("./dboperations");

const fs = require("fs");
var express = require("express");
var bodyParser = require("body-parser");
var cors = require("cors");
const multer = require("multer");
const mkdirp = require("mkdirp");
const sharp = require("sharp");
const path = require("path");
const { v4: uuid } = require("uuid");
const { request, response } = require("express");
var app = express();
var router = express.Router();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  cors({
    origin: "*",
  })
);
app.use("/api/dis", router);

router.use((request, response, next) => {
  //write authen here

  response.setHeader("Access-Control-Allow-Origin", "*"); //หรือใส่แค่เฉพาะ domain ที่ต้องการได้
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Access-Control-Allow-Credentials", true);

  // console.log("middleware");
  next();
});

router.route("/health").get((request, response) => {
  // console.log("health check");
  response.json({ status: 200 });
});

const UPLOAD_PATH = path.join(process.env.imgPath, "/DIS");
mkdirp.sync(path.join(process.env.imgPath, "/DIS"));

const storage = multer.diskStorage({
  destination: (req, file, done) => {
    done(null, UPLOAD_PATH);
  },
  filename: (req, file, done) => {
    done(null, uuid() + "___" + file.originalname);
  },
});

const limits = {
  fileSize: 5 * 1024 * 1024,
};

const fileFilter = (request, file, done) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    done(null, true);
  } else {
    done(new Error("file type not supported"), false);
  }
};

const upload = multer({ storage, limits, fileFilter }).single("image");

async function imgUpload(file, id) {
  console.log("Image check");
  if (!file) {
    console.log("No image found to upload");
  } else {
    const newFilePath = path.join(UPLOAD_PATH, id + ".jpg");
    // save newFilePath in your db as image path
    await sharp(file.path).resize().jpeg({ quality: 50 }).toFile(newFilePath);
    fs.unlinkSync(file.path);

    console.log("Image upload complete");
  }
}

router.route("/adddruginfo").post((request, response) => {
  upload(request, response, async (err) => {
    if (err) {
      return response
        .status(400)
        .json({ success: false, message: err.message });
    }
    try {
      const data = request.body;
      const { file } = request;
      dboperations
        .addDrugInfo(data)
        .then((result) => {
          imgUpload(file, data.id);
          response.json(result);
        })
        .catch((err) => {
          console.error(err);
          response.sendStatus(500);
        });
    } catch (error) {
      return response
        .status(500)
        .json({ success: false, message: error.message });
    }
  });
});

router.route("/updatedruginfo").post((request, response) => {
  upload(request, response, async (err) => {
    if (err) {
      return response
        .status(400)
        .json({ success: false, message: err.message });
    }
    try {
      const data = request.body;
      const { file } = request;
      dboperations
        .updateDrugInfo(data)
        .then((result) => {
          imgUpload(file, data.id);
          response.json(result);
        })
        .catch((err) => {
          console.error(err);
          response.sendStatus(500);
        });
    } catch (error) {
      return response
        .status(500)
        .json({ success: false, message: error.message });
    }
  });
});

router.route("/getalldruginfo").get((request, response) => {
  dboperations
    .getAllDrugInfo()
    .then((result) => {
      response.json(result);
    })
    .catch((err) => {
      console.error(err);
      response.sendStatus(500);
    });
});

router.route("/getdruginfo/:id").get((request, response) => {
  dboperations
    .getDrugInfoById(request.params.id)
    .then((result) => {
      response.json(result);
    })
    .catch((err) => {
      console.error(err);
      response.sendStatus(500);
    });
});

router.route("/getdrugimg/:id").get((request, response) => {
  try {
    const readStream = fs.createReadStream(
      `${process.env.imgPath}/DIS/${request.params.id}.jpg`
    );
    readStream.on("error", function (err) {
      console.error(err);
      response.json({ status: "error", message: "No image found" });
    });
    readStream.pipe(response);
  } catch (error) {
    console.error(error);
    response.sendStatus(500);
  }
});

router.route("/getinstgrp").get((request, response) => {
  dboperations
    .getInstGrp()
    .then((result) => {
      response.json(result);
    })
    .catch((err) => {
      console.error(err);
      response.sendStatus(500);
    });
});

router.route("/addinstgrp").post((request, response) => {
  let instGrpData = { ...request.body };
  dboperations
    .addInstGrp(instGrpData)
    .then((result) => {
      response.status(201).json(result);
    })
    .catch((err) => {
      console.error(err);
      response.setStatus(500);
    });
});

router.route("/updateinstgrp").post((request, response) => {
  let instGrpData = { ...request.body };
  dboperations
    .updateInstGrp(instGrpData)
    .then((result) => {
      response.status(201).json(result);
    })
    .catch((err) => {
      console.error(err);
      response.setStatus(500);
    });
});

router.route("/getproptygrp").get((request, response) => {
  dboperations
    .getProptyGrp()
    .then((result) => {
      response.json(result);
    })
    .catch((err) => {
      console.error(err);
      response.sendStatus(500);
    });
});

router.route("/addproptygrp").post((request, response) => {
  let proptyGrpData = { ...request.body };
  dboperations
    .addProptyGrp(proptyGrpData)
    .then((result) => {
      response.status(201).json(result);
    })
    .catch((err) => {
      console.error(err);
      response.setStatus(500);
    });
});

router.route("/updateproptygrp").post((request, response) => {
  let proptyGrpData = { ...request.body };
  dboperations
    .updateProptyGrp(proptyGrpData)
    .then((result) => {
      response.status(201).json(result);
    })
    .catch((err) => {
      console.error(err);
      response.setStatus(500);
    });
});

router.route("/getwarngrp").get((request, response) => {
  dboperations
    .getWarnGrp()
    .then((result) => {
      response.json(result);
    })
    .catch((err) => {
      console.error(err);
      response.sendStatus(500);
    });
});

router.route("/addwarngrp").post((request, response) => {
  let warnGrpData = { ...request.body };
  dboperations
    .addWarnGrp(warnGrpData)
    .then((result) => {
      response.status(201).json(result);
    })
    .catch((err) => {
      console.error(err);
      response.setStatus(500);
    });
});

router.route("/updatewarngrp").post((request, response) => {
  let warnGrpData = { ...request.body };
  dboperations
    .updateWarnGrp(warnGrpData)
    .then((result) => {
      response.status(201).json(result);
    })
    .catch((err) => {
      console.error(err);
      response.setStatus(500);
    });
});

router.route("/getversion").get((request, response) => {
  dboperations
    .getVersion()
    .then((result) => {
      response.json(result);
    })
    .catch((err) => {
      console.error(err);
      response.setStatus(500);
    });
});

var port = process.env.PORT;
app.listen(port);
console.log("DIS API is running at " + port);
