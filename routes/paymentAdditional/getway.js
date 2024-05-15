const paymentMode = require("../../model/payment_additional/addPaymentModel");
const router = require("express").Router();
const UPI_ID = require("../../model/upi_ids");
const PaymentModes = require("../../model/payments/pamentModeModel")

//Adding then Payment gateway
router.post('/addGateway', async (req, res) => {
    try {
        const { gatewayName } = req.body;
        const existingPaymentMode = await paymentMode.findOne({ gatewayName: gatewayName });

        if (existingPaymentMode) {
            return res.status(400).send({
                message: 'Payment mode with the same name already exists'
            });
        }

        const newPaymentMode = new paymentMode({
            gatewayName: gatewayName
        });

        const savedPaymentMode = await newPaymentMode.save();

        if (savedPaymentMode) {
            return res.status(200).send({
                message: 'Payment mode added successfully',
                data: savedPaymentMode
            });
        } else {
            return res.status(500).send({
                message: 'Failed to add payment mode'
            });
        }
    } catch (error) {
        return res.status(400).send({
            status: 0,
            error: error.message
        });
    }
});

//List the  Payment gateway
router.get('/listGateways', async (req, res) => {
    try {
        const paymentModes = await paymentMode.find();
        if (paymentModes.length > 0) {
            res.status(200).send({
                message: 'Payment modes retrieved successfully',
                data: paymentModes
            });
        } else {
            res.status(404).send({
                message: 'No payment modes found'
            });
        }
    } catch (error) {
        res.status(500).send({
            message: 'Failed to retrieve payment modes',
            error: error.message
        });
    }
});

//Find the payment gateway by Name 
router.get('/findGatewayByName', async (req, res) => {
    try {
        const { gatewayName } = req.body;
        console.log(gatewayName, "paymentName")
        const findGateway = await paymentMode.findOne({ gatewayName: gatewayName });
        if (findGateway) {
            res.status(200).send({
                message: 'Payment mode found',
                data: findGateway
            });
        } else {
            res.status(404).send({
                message: 'Payment mode not found'
            });
        }
    } catch (error) {
        res.status(500).send({
            message: 'Failed to find payment mode',
            error: error.message
        });
    }
});

//Get UpiId
router.get("/getUpiId", async (req, res) => {
    try {
        const findUpi = await UPI_ID.findOne(
            { is_Active: true }
        );
        if (findUpi) {
            res.status(200).send({
                message: 'Upi Id show successfully',
                data: findUpi
            });
        } else {
            res.status(200).send({
                message: 'No Upi Is Active',
                data: []
            });
        }
    } catch (error) {
        res.status(500).send({
            message: 'Something went wrong',
            error: error.message
        });
    }
});

//Add Payment mode
router.post("/addPaymentMode", async (req, res) => {
    try {
        const { paymentMode, paymentStatus } = req.body;
        if (!paymentMode || !paymentStatus) {
            res.status(400).send({
                statusCode: 400,
                message: 'both field required',
            });
        }
        // Check if any UPI ID is already active only when enabling a new one
        if (paymentStatus == true) {
            const findActiveUpi = await UPI_ID.findOne({ is_Active: true });
            if (findActiveUpi) {
                return res.json({
                    status: 0,
                    message: "Another UPI ID is already active. Please deactivate it first.",
                });
            }
        }
        const payment = new PaymentModes({
            paymentMode: paymentMode,
            status: paymentStatus
        })
        await payment.save();
        // let payMentDetails = await PaymentModes.find();
        res.status(200).send({
            statusCode: 200,
            message: "payment mode add successfully ",
            data: payment,
        });
    } catch (error) {
        res.status(500).send({
            statusCode: 500,
            message: 'Something went wrong',
            error: error.message
        });
    }
});

//Update Payment Mode
router.put("/updatePaymentMode/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).send({
                statusCode: 400,
                message: 'id required',
            });
        }

        const findMode = await PaymentModes.findOne({ _id: id });
        if (!findMode) {
            res.status(404).send({
                statusCode: 404,
                message: 'Payment mode not found',
            });
            return;
        }

        const paymentUpdate = await PaymentModes.updateOne({ _id: findMode._id }, { $set: { status: "disable" } });
        res.status(200).send({
            statusCode: 200,
            message: "Payment mode updated successfully",
            data: paymentUpdate,
        });
    } catch (error) {
        res.status(500).send({
            statusCode: 500,
            message: 'Something went wrong',
            error: error.message
        });
    }
});

//Get all payment Mode
router.get("/getPaymentMode", async (req, res) => {
    try {
        let payMentDetails = await PaymentModes.findOne({ status: "active" });
        let data = {
            payMentDetails
        }
        if (payMentDetails.paymentMode.toUpperCase() === "UPI") {
            let marchangeDetails = await UPI_ID.findOne({ is_Active: true });
            data.marchangeDetails = marchangeDetails
        }
        res.status(200).send({
            statusCode: 200,
            message: "payment mode details show successfully",
            data,
        });
    } catch (error) {
        res.status(500).send({
            statusCode: 500,
            message: 'Something went wrong',
            error: error.message
        });
    }
});

//Delete payment mode
router.delete("/deletePaymentMode/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).send({
                statusCode: 400,
                message: 'id required',
            });
        }
        let paymentDelete = await PaymentModes.deleteOne({ _id: id });
        if (paymentDelete) {
            res.status(200).send({
                statusCode: 200,
                message: "Payment Mode Delete successfully!",
            });
        }
    } catch (error) {
        res.status(500).send({
            message: 'Something went wrong',
            error: error.message
        });
    }
});

module.exports = router;
