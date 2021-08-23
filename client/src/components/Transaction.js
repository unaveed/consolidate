import React from "react";

const Transaction = ({ description, postDate, transactionDate, amount }) => {
    return (
        <div className="transaction">
            <h4>{description}</h4>
            <p>{postDate}</p>
            <p>{transactionDate}</p>
            <span>{amount}</span>
        </div>
    );
};

export default Transaction;
