import React, { useState } from "react";
import { getTransactionDiff } from "../api/transactionsApi";
import Transaction from "../components/Transaction";

const TransactionContainer = () => {
    const [transactions, setTransactions] = useState([]);
    const [ynabFile, setYnabFile] = useState(null);
    const [sourceFile, setSourceFile] = useState(null);
    const [submitError, setSubmitError] = useState("");

    const handleYnabChange = (event) => {
        setYnabFile(event.target.files[0]);
    };

    const buildFormData = () => {
        if (ynabFile && sourceFile) {
            const formData = new FormData();
            formData.append("ynab", ynabFile);
            formData.append("account", sourceFile);

            return formData;
        }

        return null;
    };

    const displayTransactions = () => {
        if (transactions) {
            const transactionList = transactions.map((transaction) => (
                <li>
                    <Transaction
                        description={transaction["Description"]}
                        amount={transaction["Amount"]}
                        postDate={transaction["Post Date"]}
                        transactionDate={transaction["Transaction Date"]}
                    />
                </li>
            ));
            return <ul>{transactionList}</ul>;
        } else {
            return null;
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = buildFormData();
        console.log("FormData", formData);
        if (formData) {
            const result = await getTransactionDiff(formData);
            if (result.error) {
                setSubmitError(
                    `Could not upload files, server return error ${result.error.code}: ${result.error.message}`
                );
            }

            setTransactions(result.data);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label>
                    YNAB: <input type="file" onChange={handleYnabChange} />
                </label>
                <label>
                    Source Account:{" "}
                    <input
                        type="file"
                        onChange={(e) => setSourceFile(e.target.files[0])}
                    />
                </label>
                <input type="submit" value="Upload files" />
            </form>
            {submitError}
            {displayTransactions()}
        </div>
    );
};

export default TransactionContainer;
