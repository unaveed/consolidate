import express from "express";
import multer from "multer";
import csv from "fast-csv";
import fs from "fs";
import csvConverter from "csvtojson";

const DATETIME_TO_DAYS = 1000 * 60 * 60 * 24;
const SOURCE_ACCOUNT = "Chase";
const router = express.Router();
const upload = multer({ dest: "uploads/" });

async function uploadFiles(req, res) {
    console.log(req.body);
    console.log(req.files);
    const csv_files = {};

    const ynab = req.files.ynab[0];
    const account = req.files.account[0];

    const accountTrans = await processFile(account, ynab);
    // req.files.forEach((f) => {
    //     const filename = f.originalname;
    //     const rows = [];
    //     fs.createReadStream(f.path)
    //         .pipe(csv.parse({ headers: true, ignoreEmpty: true }))
    //         .on("error", (error) => console.error(error))
    //         .on("data", (row) => console.log(row))
    //         .on("end", (rowCount) => console.log(`Parsed ${rowCount} rows`));
    //     csv_files[filename] = rows;
    // });
    res.json({ message: "Successfully uploaded files.", data: accountTrans });
}

async function processFile(source, ynab) {
    const sourcePath = source.path;
    const ynabPath = ynab.path;

    const accountTrans = {};

    const ynabArray = await csvConverter()
        .fromFile(ynabPath)
        .subscribe((jsonObject) => {
            const outflowAmount = -1 * jsonObject.Outflow.split("$")[1];
            const inflowAmount = jsonObject.Inflow.split("$")[1];

            const outflow = parseFloat(outflowAmount);
            const inflow = parseFloat(inflowAmount);

            const amount = outflow !== 0.0 ? outflow : inflow;
            jsonObject.Amount = amount;

            const date = jsonObject.Date;
            jsonObject.Date = new Date(date);
        });

    ynabArray
        .filter((transaction) => transaction.Account === SOURCE_ACCOUNT)
        .forEach((row) => {
            const amount = row.Amount;
            if (!accountTrans[amount]) {
                console.log("doesnt have amount", amount);
                accountTrans[amount] = [row];
            } else {
                console.log("has amount", amount);
                const trans = accountTrans[amount];
                trans.push(row);
            }
        });

    const sourceArray = await csvConverter()
        .fromFile(sourcePath)
        .subscribe((jsonObject) => {
            const amount = jsonObject.Amount;
            jsonObject.Amount = parseFloat(amount);
            const date = new Date(jsonObject.Date);
            jsonObject.Date = date;
        });

    const filteredTransactions = sourceArray
        .filter((transaction) => !accountTrans[transaction.Amount])
        .sort((t1, t2) => t2.Date - t1.Date);
    return filteredTransactions;
}

router.post(
    "/",
    upload.fields([
        { name: "ynab", maxCount: 1 },
        { name: "account", maxCount: 1 },
    ]),
    uploadFiles
);

export default router;
