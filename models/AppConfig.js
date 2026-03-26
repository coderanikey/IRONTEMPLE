import mongoose from 'mongoose';

const appConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    inviteKeyHash: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const AppConfig = mongoose.models.AppConfig || mongoose.model('AppConfig', appConfigSchema);

export default AppConfig;

