require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
var config = require("./dbconfig");
const sql = require("mssql");

async function idChk(id) {
  let pool = await sql.connect(config);
  let result = await pool
    .request()
    .input("id", sql.VarChar, id)
    .query("SELECT * WHERE");
}

async function addDrugInfo(data) {
  try {
    console.log("addDrugInfo id : " + data.id + " call, try connect to server");
    let pool = await sql.connect(config);
    console.log("connect complete");

    let result = await pool
      .request()
      .input("id", sql.VarChar, data.id)
      .input("name_en", sql.VarChar, data.name_en)
      .input("name_th", sql.VarChar, data.name_th)
      .input("inst_grp_id", sql.Int, data.inst_grp_id)
      .input("inst", sql.VarChar, data.inst)
      .input("propty_grp_id", sql.Int, data.propty_grp_id)
      .input("propty", sql.VarChar, data.propty)
      .input("warn_grp_id", sql.VarChar, data.warn_grp_id)
      .input("warn", sql.VarChar, data.warn)
      .input("create_by", sql.VarChar, data.create_by)
      .input("remark", sql.VarChar, data.remark)
      .query(
        "INSERT INTO dis_info" +
          " (id, name_en, name_th, inst_grp_id, inst, propty_grp_id, propty, warn_grp_id, warn, create_by, create_date, remark)" +
          " VALUES (@id, @name_en, @name_th, @inst_grp_id, @inst, @propty_grp_id, @propty, @warn_grp_id, @warn, @create_by, GETDATE(), @remark)"
      );

    console.log("getAllDrugInfo complete");
    console.log("====================");
    return { status: "ok", message: "เพิ่มข้อมูลลงระบบเรียบร้อยแล้ว" };
  } catch (error) {
    console.error(error);
    return { status: "error", message: error.message };
  }
}

async function updateDrugInfo(data) {
  try {
    console.log(
      "updateDrugInfo id : " + data.id + " call, try connect to server"
    );
    let pool = await sql.connect(config);
    console.log("connect complete");
    console.log(data.inactive);
    await pool
      .request()
      .input("id", sql.VarChar, data.id)
      .input("name_en", sql.VarChar, data.name_en)
      .input("name_th", sql.VarChar, data.name_th)
      .input("inst_grp_id", sql.Int, data.inst_grp_id)
      .input("inst", sql.VarChar, data.inst)
      .input("propty_grp_id", sql.Int, data.propty_grp_id)
      .input("propty", sql.VarChar, data.propty)
      .input("warn_grp_id", sql.VarChar, data.warn_grp_id)
      .input("warn", sql.VarChar, data.warn)
      .input("last_edit_by", sql.VarChar, data.last_edit_by)
      .input("inactive", sql.Bit, parseInt(data.inactive))
      .input("remark", sql.VarChar, data.remark)
      .query(
        "UPDATE dis_info" +
          " SET name_en = @name_en" +
          ", name_th = @name_th" +
          ", inst_grp_id = @inst_grp_id" +
          ", inst = @inst" +
          ", propty_grp_id = @propty_grp_id" +
          ", propty = @propty" +
          ", warn_grp_id = @warn_grp_id" +
          ", warn = @warn" +
          ", last_edit_by = @last_edit_by" +
          ", last_edit_date = GETDATE()" +
          ", inactive = @inactive" +
          ", remark = @remark" +
          " WHERE id = @id"
      );

    console.log("updateDrugInfo complete");
    console.log("====================");
    return { status: "ok", message: "อัพเดทข้อมูลในระบบเรียบร้อยแล้ว" };
  } catch (error) {
    console.error(error);
    return { status: "error", message: error.message };
  }
}

const drugInfoQuery =
  "SELECT di.id, di.name_en, di.name_th, di.inst_grp_id, di.inst, di.propty_grp_id, di.propty, di.warn_grp_id, di.warn" +
  ", di.create_by, di.create_date, di.last_edit_by, di.last_edit_date, di.inactive, di.remark" +
  ", dig.name AS inst_grp_name, dig.descr AS inst_grp_descr, dig.inactive AS inst_grp_inactive" +
  ", dpg.name AS propty_grp_name, dpg.descr AS propty_grp_descr, dpg.inactive AS propty_grp_inactive" +
  ", dwg.name AS warn_grp_name, dwg.descr AS warn_grp_descr, dwg.inactive AS warn_grp_inactive" +
  " FROM dis_info di" +
  " LEFT JOIN dis_inst_grp dig ON dig.id = di.inst_grp_id" +
  " LEFT JOIN dis_propty_grp dpg ON dpg.id = di.propty_grp_id" +
  " LEFT JOIN dis_warn_grp dwg ON dwg.id = di.warn_grp_id";

async function getAllDrugInfo() {
  try {
    console.log("getAllDrugInfo call, try connect to server");
    let pool = await sql.connect(config);
    console.log("connect complete");
    let result = await pool.request().query(drugInfoQuery);
    console.log("getAllDrugInfo complete");
    console.log("====================");
    return result.recordsets[0];
  } catch (error) {
    console.error(error);
    return { status: "error", message: error.message };
  }
}

async function getDrugInfoById(id) {
  try {
    console.log("getDrugInfoById call, try connect to server");
    let pool = await sql.connect(config);
    console.log("connect complete");
    let result = await pool
      .request()
      .input("id", sql.VarChar, id)
      .query(drugInfoQuery + " WHERE di.id = @id");
    console.log("getDrugInfoById complete");
    console.log("====================");
    return result.recordset[0];
  } catch (error) {
    console.error(error);
    return { status: "error", message: error.message };
  }
}

async function getInstGrp() {
  try {
    console.log("getInstGrp call, try connect to server");
    let pool = await sql.connect(config);
    console.log("connect complete");

    let result = await pool.request().query("SELECT * FROM dis_inst_grp");

    console.log("getInstGrp complete");
    console.log("====================");
    return result.recordsets[0];
  } catch (error) {
    console.error(error);
    return { status: "error", message: error.message };
  }
}

async function addInstGrp(data) {
  try {
    console.log("addInstGrp call, try connect to server");
    let pool = await sql.connect(config);
    console.log("connect complete");

    await pool
      .request()
      .input("name", sql.VarChar, data.name)
      .input("descr", sql.VarChar, data.descr)
      .input("create_by", sql.VarChar, data.create_by)
      .input("remark", sql.VarChar, data.remark)
      .query(
        "INSERT INTO dis_inst_grp" +
          " (name, descr, create_by, create_date, remark)" +
          " VALUES (@name, @descr, @create_by, GETDATE(), @remark)"
      );

    console.log("addInstGrp complete");
    console.log("====================");
    return { status: "ok", message: "เพิ่มข้อมูลลงระบบเรียบร้อยแล้ว" };
  } catch (error) {
    console.error(error);
    return { status: "error", message: error.message };
  }
}

async function updateInstGrp(data) {
  try {
    console.log(
      "updateInstGrp id : " + data.id + " call, try connect to server"
    );
    let pool = await sql.connect(config);
    console.log("connect complete");

    await pool
      .request()
      .input("id", sql.Int, data.id)
      .input("name", sql.VarChar, data.name)
      .input("descr", sql.VarChar, data.descr)
      .input("last_edit_by", sql.VarChar, data.last_edit_by)
      .input("inactive", sql.Bit, data.inactive)
      .input("remark", sql.VarChar, data.remark)
      .query(
        "UPDATE dis_inst_grp" +
          " SET name = @name" +
          ", descr = @descr" +
          ", last_edit_by = @last_edit_by" +
          ", last_edit_date = GETDATE()" +
          ", inactive = @inactive" +
          ", remark = @remark" +
          " WHERE id = @id"
      );

    console.log("updateInstGrp complete");
    console.log("====================");
    return { status: "ok", message: "อัพเดทข้อมูลในระบบเรียบร้อยแล้ว" };
  } catch (error) {
    console.error(error);
    return { status: "error", message: error.message };
  }
}

async function getProptyGrp() {
  try {
    console.log("getProptyGrp call, try connect to server");
    let pool = await sql.connect(config);
    console.log("connect complete");

    let result = await pool.request().query("SELECT * FROM dis_propty_grp");

    console.log("getProptyGrp complete");
    console.log("====================");
    return result.recordsets[0];
  } catch (error) {
    console.error(error);
    return { status: "error", message: error.message };
  }
}

async function addProptyGrp(data) {
  try {
    console.log("addProptyGrp call, try connect to server");
    let pool = await sql.connect(config);
    console.log("connect complete");

    await pool
      .request()
      .input("name", sql.VarChar, data.name)
      .input("descr", sql.VarChar, data.descr)
      .input("create_by", sql.VarChar, data.create_by)
      .input("remark", sql.VarChar, data.remark)
      .query(
        "INSERT INTO dis_propty_grp" +
          " (name, descr, create_by, create_date, remark)" +
          " VALUES (@name, @descr, @create_by, GETDATE(), @remark)"
      );

    console.log("addProptyGrp complete");
    console.log("====================");
    return { status: "ok", message: "เพิ่มข้อมูลลงระบบเรียบร้อยแล้ว" };
  } catch (error) {
    console.error(error);
    return { status: "error", message: error.message };
  }
}

async function updateProptyGrp(data) {
  try {
    console.log(
      "updateProptyGrp id : " + data.id + " call, try connect to server"
    );
    let pool = await sql.connect(config);
    console.log("connect complete");

    await pool
      .request()
      .input("id", sql.Int, data.id)
      .input("name", sql.VarChar, data.name)
      .input("descr", sql.VarChar, data.descr)
      .input("last_edit_by", sql.VarChar, data.last_edit_by)
      .input("inactive", sql.Bit, data.inactive)
      .input("remark", sql.VarChar, data.remark)
      .query(
        "UPDATE dis_propty_grp" +
          " SET name = @name" +
          ", descr = @descr" +
          ", last_edit_by = @last_edit_by" +
          ", last_edit_date = GETDATE()" +
          ", inactive = @inactive" +
          ", remark = @remark" +
          " WHERE id = @id"
      );

    console.log("updateProptyGrp complete");
    console.log("====================");
    return { status: "ok", message: "อัพเดทข้อมูลในระบบเรียบร้อยแล้ว" };
  } catch (error) {
    console.error(error);
    return { status: "error", message: error.message };
  }
}

async function getWarnGrp() {
  try {
    console.log("getWarnGrp call, try connect to server");
    let pool = await sql.connect(config);
    console.log("connect complete");

    let result = await pool.request().query("SELECT * FROM dis_warn_grp");

    console.log("getWarnGrp complete");
    console.log("====================");
    return result.recordsets[0];
  } catch (error) {
    console.error(error);
    return { status: "error", message: error.message };
  }
}

async function addWarnGrp(data) {
  try {
    console.log("addWarnGrp call, try connect to server");
    let pool = await sql.connect(config);
    console.log("connect complete");

    await pool
      .request()
      .input("name", sql.VarChar, data.name)
      .input("descr", sql.VarChar, data.descr)
      .input("create_by", sql.VarChar, data.create_by)
      .input("remark", sql.VarChar, data.remark)
      .query(
        "INSERT INTO dis_warn_grp" +
          " (name, descr, create_by, create_date, remark)" +
          " VALUES (@name, @descr, @create_by, GETDATE(), @remark)"
      );

    console.log("addWarnGrp complete");
    console.log("====================");
    return { status: "ok", message: "เพิ่มข้อมูลลงระบบเรียบร้อยแล้ว" };
  } catch (error) {
    console.error(error);
    return { status: "error", message: error.message };
  }
}

async function updateWarnGrp(data) {
  try {
    console.log(
      "updateWarnGrp id : " + data.id + " call, try connect to server"
    );
    let pool = await sql.connect(config);
    console.log("connect complete");

    await pool
      .request()
      .input("id", sql.Int, data.id)
      .input("name", sql.VarChar, data.name)
      .input("descr", sql.VarChar, data.descr)
      .input("last_edit_by", sql.VarChar, data.last_edit_by)
      .input("inactive", sql.Bit, data.inactive)
      .input("remark", sql.VarChar, data.remark)
      .query(
        "UPDATE dis_warn_grp" +
          " SET name = @name" +
          ", descr = @descr" +
          ", last_edit_by = @last_edit_by" +
          ", last_edit_date = GETDATE()" +
          ", inactive = @inactive" +
          ", remark = @remark" +
          " WHERE id = @id"
      );

    console.log("updateWarnGrp complete");
    console.log("====================");
    return { status: "ok", message: "อัพเดทข้อมูลในระบบเรียบร้อยแล้ว" };
  } catch (error) {
    console.error(error);
    return { status: "error", message: error.message };
  }
}

async function getVersion() {
  try {
    return process.env.version;
  } catch (error) {
    console.error(error);
    return { status: "error", message: error.message };
  }
}

module.exports = {
  addDrugInfo: addDrugInfo,
  updateDrugInfo: updateDrugInfo,
  getAllDrugInfo: getAllDrugInfo,
  getDrugInfoById: getDrugInfoById,
  getInstGrp: getInstGrp,
  addInstGrp: addInstGrp,
  updateInstGrp: updateInstGrp,
  getProptyGrp: getProptyGrp,
  addProptyGrp: addProptyGrp,
  updateProptyGrp: updateProptyGrp,
  getWarnGrp: getWarnGrp,
  addWarnGrp: addWarnGrp,
  updateWarnGrp: updateWarnGrp,
  getVersion: getVersion,
};
