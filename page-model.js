const mongoose = require('mongoose');

const { Schema } = mongoose;

const PageSchema = new Schema({
  url: {
    type: String,
    required: true,
    unique: true,
  },
  keywords: [{
    word: String,
    times: Number,
  }],
}, {
  timestamps: true,
});

const Page = mongoose.model('Page', PageSchema);

module.exports = Page;
