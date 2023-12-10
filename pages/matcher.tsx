import Image from 'next/image';
import Link from 'next/link';
import React, { FC, useEffect, useState } from 'react';
import DefLayout from '@/components/def_layout';

import Modal from './modal';
import WorkoutBuddyMatcher from './WorkoutBuddyMatcher';
import { getCookie } from 'cookies-next';
import '@/public/styles/matcher.css';

// Person interface for matcher data
interface Person {
    uid: string;
    name: string;
    location: string;
    workoutTypes: string;
    softPreferences: string;
    frequency: string;
    gymAvailability: string;
}

interface MatchedPersonDisplayProps {
    person: Person;
}

// Component for displaying individual matched person's information
const MyDisplay: React.FC<MatchedPersonDisplayProps> = ({ person }) => {
    // Parse frequency and workout types to a more readable format
    const parseList = (listString: string) => {
        return listString.replace(/[{}"]/g, '').split(',').join(', ');
    };

    // Function to parse gym availability to a more readable format
    const parseGymAvailability = (availabilityString: string) => {
        const times = ["6:00", "7:00", "8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];
        return availabilityString.replace(/[{}"]/g, '').split(',')
            .map((available, index) => available === 'true' ? times[index] : null)
            .filter(time => time !== null)
            .join(', ');
    };

    // State for controlling show more/less functionality
    const [showMore, setShowMore] = useState<boolean>(false);

    const toggleShowMore = () => {
        setShowMore(!showMore);
    };

    const MAX_ABOUT_LENGTH = 50;

    return (
        <div className="grid grid-cols-5 gap-1">
            <p className="col-span-1 font-bold">Location:</p>
            <p className="col-span-4">{person.location !== null ? person.location : 'Not specified'}</p>

            <p className="col-span-1 font-bold">Frequency:</p>
            <p className="col-span-4">{person.frequency !== null ? parseList(person.frequency) : 'Not specified'}</p>

            <p className="col-span-1 font-bold">Gym:</p>
            <p className="col-span-4">{person.gymAvailability !== null ? parseGymAvailability(person.gymAvailability) : 'Not specified'}</p>

            <p className="col-span-1 font-bold">Workout Types:</p>
            <p className="col-span-4">{person.workoutTypes !== null ? parseList(person.workoutTypes) : 'Not specified'}</p>

            <p className="col-span-1 font-bold">More Info:</p>
            <p className="col-span-4 overflow-x-auto">
                {showMore ? person.softPreferences : person.softPreferences?.slice(0, MAX_ABOUT_LENGTH) || 'Not specified'}
                {person.softPreferences && person.softPreferences.length > MAX_ABOUT_LENGTH && (
                    <button onClick={() => toggleShowMore()} className="text-[#2FABDD] hover:underline ml-2">
                        {showMore ? 'Show Less' : 'Show More'}
                    </button>
                )}
            </p>
        </div>
    );
};

// Component for displaying matched persons
const MatchedPersonDisplay: React.FC<MatchedPersonDisplayProps> = ({ person }) => {
    // Parse frequency and workout types to a more readable format
    const parseList = (listString: string) => {
        return listString.replace(/[{}"]/g, '').split(',').join(', ');
    };

    // Function to parse gym availability to a more readable format
    const parseGymAvailability = (availabilityString: string) => {
        const times = ["6:00", "7:00", "8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];
        return availabilityString.replace(/[{}"]/g, '').split(',')
            .map((available, index) => available === 'true' ? times[index] : null)
            .filter(time => time !== null)
            .join(', ');
    };

    const handleSendFriendRequest = async () => {
        const currentUser = getCookie('uid');
        let receiverUid;

        try {
            // Fetch the UID for the receiving person
            const response = await fetch('/api/friends/getUIDfromName', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: person.name }),
            });

            if (response.ok) {
                const data = await response.json();
                receiverUid = data.uid;
            } else {
                console.error('Response not OK when getting UID');
                return;
            }
        } catch (error) {
            console.error('Error in getting uid from name:', error);
            return;
        }

        try {
            // Send the friend request
            const friendRequestResponse = await fetch('/api/friends/sendFriendRequest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sender: currentUser, receiver: receiverUid })
            });

            if (friendRequestResponse.ok) {
                console.log(`Friend request sent!`);
            } else {
                console.error('Error sending friend request:', friendRequestResponse.statusText);
            }
        } catch (error) {
            console.error('Error handling friend request:', error);
        }

        window.location.reload();
    };

    const [showMore, setShowMore] = useState<boolean>(false);

    const toggleShowMore = () => {
        setShowMore(!showMore);
    };

    const MAX_ABOUT_LENGTH = 50;

    return (
        <div>
            <div className="flex flex-row items-center justify-between">
                <h2 className="text-2xl font-bold  gradient-text-pb ">{person.name || 'Not specified'}</h2>
                <button
                    onClick={handleSendFriendRequest}
                    className="bg-[#2FABDD] hover:bg-[#1A90C0] text-white font-bold py-1 px-2 rounded"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                    </svg>

                </button>
            </div>

            <div className="grid grid-cols-5 gap-1 mb-5">
                <p className="col-span-1 font-bold">Location:</p>
                <p className="col-span-4">{person.location !== null ? person.location : 'Not specified'}</p>

                <p className="col-span-1 font-bold">Frequency:</p>
                <p className="col-span-4">{person.frequency !== null ? parseList(person.frequency) : 'Not specified'}</p>

                <p className="col-span-1 font-bold">Gym:</p>
                <p className="col-span-4">{person.gymAvailability !== null ? parseGymAvailability(person.gymAvailability) : 'Not specified'}</p>

                <p className="col-span-1 font-bold">Workout Types:</p>
                <p className="col-span-4">{person.workoutTypes !== null ? parseList(person.workoutTypes) : 'Not specified'}</p>

                <p className="col-span-1 font-bold">More Info:</p>
                <p className="col-span-4">
                    {showMore ? person.softPreferences : person.softPreferences?.slice(0, MAX_ABOUT_LENGTH) || 'Not specified'}
                    {person.softPreferences && person.softPreferences.length > MAX_ABOUT_LENGTH && (
                        <button onClick={() => toggleShowMore()} className="text-[#2FABDD] hover:underline ml-2">
                            {showMore ? 'Show Less' : 'Show More'}
                        </button>
                    )}
                </p>
            </div>
        </div>
    );
};


// Matcher component - main component for the page
const Matcher: React.FC = () => {
    const [showMatcherForm, setShowMatcherForm] = useState(false);
    const [matchedPersons, setMatchedPersons] = useState<Person[]>([]);
    const [myData, setMyData] = useState<Person[]>([]);

    // Toggle visibility of the matcher form
    const toggleMatcherForm = () => setShowMatcherForm(!showMatcherForm);

    // Fetch data when component mounts
    useEffect(() => {
        getMatcher("");
        getMyData("");
    }, []);

    // Fetch matched persons
    const getMatcher = async (query: any) => {
        const response = await fetch('/api/getMatcher', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                searchQuery: String(getCookie('uid'))
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch matches');
        }

        const data = await response.json();
        if (data && data.data.rows) {
            setMatchedPersons(data.data.rows);
        } else {
            console.log('No rows in response');
        }
    };

    // Fetch user's own data
    const getMyData = async (query: any) => {
        const response = await fetch('/api/getMatcherData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                uid: getCookie('uid')
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch matches');
        }

        const data = await response.json();
        if (data && data.data.rows) {
            setMyData(data.data.rows);
        } else {
            console.log('No rows in response');
        }
    };

    return (
        <DefLayout>
            <div className="flex w-screen h-[88vh] justify-center items-center">
                <div className={`flex flex-col column justify-center items-center w-[35vw] h-[80vh]`}>
                    <button onClick={toggleMatcherForm} className={`p-2 border-x rounded-lg border-opacity-60 gradient-text-gp text-opacity-75 text-4xl font-bold hover:gradient-text-pg duration-300 text-center `}>
                        Matcher Form
                    </button>

                    <div className="h-[2px] w-[3vw] my-[2vh] bg-white bg-opacity-50"></div>

                    {myData.length > 0 ? (
                        <div>
                            {myData.map(person => (
                                <MyDisplay person={person} />
                            ))}
                        </div>
                    ) : ""}

                    <div className="h-[2px] w-[3vw] my-[2vh] bg-white bg-opacity-50"></div>

                    <div className="text-center">Please fill out your profile before matching :D</div>

                </div>


                <div className="h-[50vh] w-[1px] mx-[2vw] bg-white bg-opacity-40"></div>

                <Modal show={showMatcherForm} onClose={toggleMatcherForm}>
                    <WorkoutBuddyMatcher />
                </Modal>

                <div className={`flex flex-col column justify-center items-center w-[50vw] h-[80vh] overflow-y-auto`}>
                    {matchedPersons.length > 0 ? (
                        <div className='w-[48vw] max-h-[78vh] items-center justify-center overflow-y-auto'>
                            {matchedPersons.map(person => (
                                <MatchedPersonDisplay key={person.uid} person={person} />
                            ))}
                        </div>
                    ) : (
                        <p>No matches found.</p>
                    )}
                </div>
            </div>

        </DefLayout>
    );
};

export default Matcher;


