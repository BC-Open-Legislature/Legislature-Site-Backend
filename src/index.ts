import express from 'express';
import mongoose from 'mongoose';

// -=- Schemas -=-
import Members from './models/members';
import RecentMemberData from './models/recent_member_data';

import secrets from './secrets';


mongoose.connect(secrets.ReadOnlyMongoCreds)
const app = express();
const port = 5;

// TODO: Add erorr handling

// -=- MLA Data -=-
app.get('/mla', async (req, res) => {
  const members = await Members.find({ active: true })
  res.jsonp(members)
});

app.get('/mla/:mla', async (req, res) => {
  const mla = req.params.mla.replace('-', ' ')
  const member = await Members.findOne({ _id: mla })
  res.jsonp(member)
});

app.get('/mla/:mla/recent_data', async (req, res) => {
  const mla = req.params.mla.replace('-', ' ')
  const recentMemberData = await RecentMemberData.findOne({ _id: mla })
  res.jsonp(recentMemberData)
});

// -=- Start The Express Server -=- 
app.listen(port);
