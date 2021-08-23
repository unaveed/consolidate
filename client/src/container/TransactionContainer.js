import React, { useState } from "react";
import { getTransactionDiff } from "../api/transactionsApi";
import Transaction from "../components/Transaction";

const TransactionContainer = () => {
    const [transactions, setTransactions] = useState([]);
    const [ynabFile, setYnabFile] = useState(null);
    const [sourceFile, setSourceFile] = useState(null);
    const [accountName, setAccountName] = useState("");
    const [submitError, setSubmitError] = useState("");

    const handleYnabChange = (event) => {
        setYnabFile(event.target.files[0]);
    };

    const buildFormData = () => {
        if (ynabFile && sourceFile && accountName) {
            const formData = new FormData();
            formData.append("ynab", ynabFile);
            formData.append("account", sourceFile);
            formData.append("accountName", accountName);
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
        <div className="transactionsContainer">
            <form onSubmit={handleSubmit}>
                <div className="formElements">
                    <div className="inner">
                        <label>
                            YNAB:{" "}
                            <input type="file" onChange={handleYnabChange} />
                        </label>
                        <label>
                            Source Account:{" "}
                            <input
                                type="file"
                                onChange={(e) =>
                                    setSourceFile(e.target.files[0])
                                }
                            />
                        </label>
                        <label>
                            Account Name:{" "}
                            <input
                                className="accountName"
                                type="text"
                                value={accountName}
                                onChange={(e) => setAccountName(e.target.value)}
                            />
                        </label>
                        <input
                            className="btn"
                            type="submit"
                            value="Upload files"
                        />
                    </div>
                </div>
            </form>

            {submitError}
            {displayTransactions()}
        </div>
    );
};

export default TransactionContainer;
