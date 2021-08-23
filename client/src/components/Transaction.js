import React from "react";

const Transaction = ({ description, postDate, transactionDate, amount }) => {
    return (
        <div className="transaction">
            <h4 className={amount > 0 ? "green" : "red"}>${amount}</h4>
            <span className="description">{description}</span>
            <span className="dates">Transaction: {transactionDate}</span>
            <span className="dates">Posted: {postDate}</span>
        </div>
    );
};

export default Transaction;
