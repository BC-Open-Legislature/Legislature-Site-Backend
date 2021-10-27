import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

// -=- Schemas -=-
import Members from './models/members';
import RecentMemberData from './models/recent_member_data';
import Debates from './models/debate_day';

import secrets from './secrets';


mongoose.connect(secrets.ReadOnlyMongoCreds)
const app = express();
const port = 5;

app.use(cors())

// TODO: Add eror handling

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
  let recentMemberData = await RecentMemberData.findOne({ _id: mla })
  recentMemberData = {
    _id: recentMemberData._id,
    recent_votes: recentMemberData.recent_votes.slice(Math.min(0, recentMemberData.recent_votes.length-1, 4)),
    recent_debates: recentMemberData.recent_debates.slice(Math.min(0, recentMemberData.recent_debates.length-1, 4)),
  }
  res.jsonp(recentMemberData)
});

app.get('/debates', async (req, res) => {
  const debateIndexes = await (await Debates.find({}, '_id')).flatMap(x => x['_id'])
  res.jsonp(debateIndexes)
})

app.get('/debates/:date', async (req, res) => {
  const debateDataAtDate = await Debates.findOne({ _id: req.params.date })
  res.jsonp(debateDataAtDate.data)
})


app.get('/debates/:date/:index', async (req, res) => {
  const debateDataAtDate = await Debates.findOne({ _id: req.params.date })
  res.jsonp(debateDataAtDate.data[+req.params.index])
})

// -=- Start The Express Server -=- 
app.listen(port);
