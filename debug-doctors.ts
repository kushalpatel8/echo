import connectDB from './lib/mongodb';
import User from './lib/models/User';

async function debugDoctors() {
  await connectDB();
  const doctors = await User.find({ role: 'doctor', applicationStatus: 'approved' });
  console.log('Doctors Found:', doctors.length);
  doctors.forEach(d => {
    console.log(`Name: ${d.name}, ClerkID: ${d.clerkId}, ObjectID: ${d._id}`);
  });
}

debugDoctors().then(() => process.exit(0));
