import axios from "axios";

const API_BASE = "http://localhost:5000/transactions";

export const getTransactionDiff = async (formData) => {
    const response = await axios.post(API_BASE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("Response", response);

    if (response.status === 200) {
        return {
            data: response.data.data,
            error: {},
        };
    }

    return {
        data: {},
        error: {
            code: response.status,
            message: response.statusText,
        },
    };
};
