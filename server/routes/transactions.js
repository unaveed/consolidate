import express from "express";
import multer from "multer";
import csvConverter from "csvtojson";
import { equalsIgnoreCase } from "../utils/Strings.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

async function uploadFiles(req, res) {
    console.log(JSON.stringify(req.body, null, 2));
    console.log(req.files);

    const ynab = req.files.ynab[0];
    const account = req.files.account[0];
    const accountName = req.body.accountName ? req.body.accountName : "";
    const dateDelta = req.body.dateDelta ? req.body.dateDelta : 0;

    // TODO: Terminate if ynab/account/accountName is falsy

    const accountTrans = await processFile(
        account,
        ynab,
        accountName,
        dateDelta
    );
    res.json({ message: "Successfully uploaded files.", data: accountTrans });
}

async function processFile(source, ynab, accountName, dateDelta = 0) {
    const sourcePath = source.path;
    const ynabPath = ynab.path;

    const accountTransactions = {};

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
        .filter((transaction) =>
            equalsIgnoreCase(transaction.Account, accountName)
        )
        .forEach((row) => {
            const amount = row.Amount;
            if (!accountTransactions[amount]) {
                console.log("doesnt have amount", amount);
                accountTransactions[amount] = [row];
            } else {
                console.log("has amount", amount);
                const trans = accountTransactions[amount];
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
        .filter((transaction) => !accountTransactions[transaction.Amount])
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
