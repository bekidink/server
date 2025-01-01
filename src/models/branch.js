import mongoose from "mongoose";
const branchSchema = new mongoose.Schema({
  name:{type:String,required:true},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: Number, required: true },
  
  location: {
    latitude: { type: Number },
    longitude: { type: Number },
  },
  address: {
    type: String,
  },
  deliveryPartners: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "DeliveryPartner",
  },]
});
const Branch=mongoose.model("Branch",branchSchema)
export default Branch