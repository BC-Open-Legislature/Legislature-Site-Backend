import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

// -=- Interfaces -=-
import { foundDates } from './interfaces';

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

app.get('/debates/', async (req, res) => {
  const debateIndexes = (await Debates.find({}, 'date').sort({'date': -1}).limit(16)).flatMap(x => x['date'])  
  res.jsonp(debateIndexes)
})

app.get('/debates/indexes', async (req, res) => {
  const debateIndexes = (await Debates.find({}, 'date')).flatMap(x => x['date'])
  let foundYears: foundDates = {}
  let filteredDebateIndexes = debateIndexes.map(
    x => { 
      const year = x.substr(0, 4)
      if (!(year in foundYears)) {
        foundYears[year] = ''
        return year
      } 
    }
  )
    .filter(x => { return x != null })
    .reverse();
  
  res.jsonp(filteredDebateIndexes)
})

app.get('/debates/indexes/:year', async (req, res) => {
  const debateIndexes = (await Debates.find({}, 'date')).flatMap(x => x['date'])
  let foundMonths: foundDates = {}
  let filteredDebateIndexes = {
    date_indexes: debateIndexes.map(
      x => { 
        const month = x.substr(4, 2)
        const year = req.params.year
        if (!(month in foundMonths) && year === x.substr(0, 4)) {
          foundMonths[month] = ''
          return month
        } 
      }
    ).filter(x => { return x != null })
  }
  
  res.jsonp(filteredDebateIndexes)
})

app.get('/debates/indexes/:year/:month', async (req, res) => {
  const debateIndexes = (await Debates.find({}, 'date')).flatMap(x => x['date'])
  let foundDays: foundDates = {}
  let filteredDebateIndexes = {
    date_indexes: debateIndexes.map(
      x => { 
        const day = x.substr(6, 2)
        const year = req.params.year
        const month = req.params.month
        if (!(month in foundDays) && year === x.substr(0, 4) && month == x.substr(4, 2)) {
          foundDays[day] = ''
          return day
        } 
      }
    ).filter(x => { return x != null })
  }

  res.jsonp(filteredDebateIndexes)
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
