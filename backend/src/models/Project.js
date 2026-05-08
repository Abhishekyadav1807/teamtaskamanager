import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    description: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: String, enum: ["Admin", "Member"], default: "Member" }
      }
    ]
  },
  { timestamps: true }
);

projectSchema.index({ name: 1, createdBy: 1 });

export default mongoose.model("Project", projectSchema);
