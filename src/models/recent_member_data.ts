import mongoose from 'mongoose';

const RecentMemberDataSchema = new mongoose.Schema({
    _id: String,
    recent_votes: [String],
    recent_debates: [String]
});

const RecentMemberData = mongoose.model('recentMemberData', RecentMemberDataSchema, 'Recent_Member_Data');

export default RecentMemberData;