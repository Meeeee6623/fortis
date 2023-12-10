import React, { FC, useEffect, useState } from 'react';
import { getCookie }                      from 'cookies-next';
import DefLayout  from '@/components/def_layout';
import SearchBar  from "../components/SocialSearchBarComponents/SearchBar";
import styles     from './WorkoutBuddy.module.css';
import '@/public/styles/friends.css';

// interface for displaying friends
interface FlexiblePerson {
  uid: string;
  name: string;
  age?: number | null;
  height?: number | null;
  weight?: number | null;
  gender?: string | null;
  unit?: string;
  privacy?: string;
  about?: string;
  email?: string;
  totalsets?: number;
}

// handle delete friend request (for current friends and pending friends)
const handleFriendRequest = async (userId: string) => {
  const currentUser = getCookie('uid');

  const endpoint = '/api/friends/deleteFriendRequest';
  const method = 'POST';
  try {
    const response = await fetch(endpoint, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sender: currentUser, receiver: userId })
    });
    console.log(response);
  } catch (error) {
    console.error('Error handling friend request:', error);
  }
  window.location.reload();
};

// properties for displaying friends
interface FlexiblePersonListProps {
  people: FlexiblePerson[];
  onAcceptFriendRequest?: (receiver: any, sender: string) => void;
  onRejectFriendRequest?: (receiver: any, sender: string) => void;
}

// displaying friends
const FlexiblePersonList1: React.FC<FlexiblePersonListProps> = ({ people, onAcceptFriendRequest, onRejectFriendRequest }) => {
  const [showMore, setShowMore] = useState<boolean[]>(people.map(() => false));

  const toggleShowMore = (index: number) => {
    const updatedShowMore = [...showMore];
    updatedShowMore[index] = !updatedShowMore[index];
    setShowMore(updatedShowMore);
  };

  const MAX_ABOUT_LENGTH = 50;

  return (
    <ul className="">
      {people.map((person, index) => {
        // Determine if the current person is the first in the list
        const isFirstPersonActive = index === 0;
        return (
          <li key={person.uid} className={`border border-white p-3 rounded-md m-3 border-opacity-60 bg-white bg-opacity-5 ${isFirstPersonActive ? 'glow-effect ' : ''}`}>
          <div className='flex flex-row items-center justify-between'>
            <h2 className="text-2xl font-bold  gradient-text-pb">{person.name || 'Not specified'}</h2>
            <div className="flex flex-row items-center justify-center">
              {isFirstPersonActive ?
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#C32E67" className="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                </svg>
                : ''}
              <button onClick={() => handleFriendRequest(person.uid)} className="">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="ml-2 w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                </svg>
              </button>
            </div>
          </div>

          <div className='grid grid-cols-5 gap-1'>
            <p className="col-span-1 font-bold text-sm">Age:</p>
            <p className="col-span-4 text-sm">{person.age !== null ? person.age : 'Not specified'}</p>

            <p className="col-span-1 text-sm font-bold">Gender:</p>
            <p className="col-span-4 text-sm">{person.gender !== null ? person.gender : 'Not specified'}</p>

            <p className="col-span-1 font-bold text-sm">Email:</p>
            <p className="col-span-4 text-sm">{person.email !== null ? person.email : ''}</p>

            <p className="col-span-1 font-bold text-sm">Points <br /> (2w):</p>
            <p className="col-span-4 text-sm">{person.totalsets !== 0 ? person.totalsets : 'FAILURE'}</p>

            <p className="col-span-1 font-bold text-sm">About:</p>
            <p className="col-span-4 text-sm overflow-x-auto">
              {showMore[index] ? person.about : person.about?.slice(0, MAX_ABOUT_LENGTH) || 'Not specified'}
              {person.about && person.about.length > MAX_ABOUT_LENGTH && (
                <button onClick={() => toggleShowMore(index)} className="text-[#2FABDD] hover:underline ml-2">
                  {showMore[index] ? 'Show Less' : 'Show More'}
                </button>
              )}
            </p>
          </div>
        </li>
        );
      })}
    </ul>
  );
};

// displaying landing friends
const FlexiblePersonList2: React.FC<FlexiblePersonListProps> = ({ people, onAcceptFriendRequest, onRejectFriendRequest }) => {
  const [showMore, setShowMore] = useState<boolean[]>(people.map(() => false));

  const toggleShowMore = (index: number) => {
    const updatedShowMore = [...showMore];
    updatedShowMore[index] = !updatedShowMore[index];
    setShowMore(updatedShowMore);
  };

  const MAX_ABOUT_LENGTH = 50;

  return (
    <ul className="">
      {people.map((person, index) => (
        <li key={person.uid} className="border border-white p-3 rounded-md m-3 border-opacity-60  bg-white bg-opacity-5">
          <div className='flex flex-row items-center justify-between'>
            <h2 className="text-2xl font-bold  gradient-text-gp">{person.name || 'Not specified'}</h2>
            <button onClick={() => handleFriendRequest(person.uid)} className="">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
            </button>
          </div>

          <div className='grid grid-cols-5 gap-1'>
            <p className="col-span-1 text-sm font-bold">Age:</p>
            <p className="col-span-4 text-sm">{person.age !== null ? person.age : 'Not specified'}</p>

            <p className="col-span-1 text-sm font-bold">Gender:</p>
            <p className="col-span-4 text-sm">{person.age !== null ? person.gender : 'Not specified'}</p>

            <p className="col-span-1 text-sm font-bold">About:</p>
            <p className="col-span-4 text-sm">
              {showMore[index] ? person.about : person.about?.slice(0, MAX_ABOUT_LENGTH) || 'Not specified'}
              {person.about && person.about.length > MAX_ABOUT_LENGTH && (
                <button onClick={() => toggleShowMore(index)} className="text-[#2FABDD] hover:underline ml-2">
                  {showMore[index] ? 'Show Less' : 'Show More'}
                </button>
              )}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
};

// pending friends
const FlexiblePersonList: React.FC<FlexiblePersonListProps> = ({ people, onAcceptFriendRequest, onRejectFriendRequest }) => {
  const receiverUid = getCookie('uid');

  const [showMore, setShowMore] = useState<boolean[]>(people.map(() => false));

  const toggleShowMore = (index: number) => {
    const updatedShowMore = [...showMore];
    updatedShowMore[index] = !updatedShowMore[index];
    setShowMore(updatedShowMore);
  };

  const MAX_ABOUT_LENGTH = 50;

  return (
    <ul className={styles.flexiblePersonList}>
      {people.map((person, index) => (
        <li key={person.uid} className="border border-white p-3 rounded-md m-3 border-opacity-60  bg-white bg-opacity-5">
          <h2 className="text-2xl font-bold  gradient-text-bg">{person.name || 'Not specified'}</h2>

          <div className='grid grid-cols-5 gap-1'>
            <p className="col-span-1 font-bold text-sm">Age:</p>
            <p className="col-span-4 text-sm">{person.age !== null ? person.age : 'Not specified'}</p>

            <p className="col-span-1 text-sm font-bold">Gender:</p>
            <p className="col-span-4 text-sm">{person.age !== null ? person.gender : 'Not specified'}</p>

            <p className="col-span-1 text-sm font-bold">About:</p>
            <p className="col-span-4 text-sm">
              {showMore[index] ? person.about : person.about?.slice(0, MAX_ABOUT_LENGTH) || 'Not specified'}
              {person.about && person.about.length > MAX_ABOUT_LENGTH && (
                <button onClick={() => toggleShowMore(index)} className="text-[#2FABDD] hover:underline ml-2">
                  {showMore[index] ? 'Show Less' : 'Show More'}
                </button>
              )}
            </p>
          </div>

          <div className='items-center justify-center p-2 mt-3 flex flex-row border border-white rounded-md border-opacity-50'>
            {onAcceptFriendRequest && (
              <button onClick={() => onAcceptFriendRequest(receiverUid, person.uid)} className="inline-flex items-center border-r">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#55BBA4" className="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>

                <p className="pl-2 pr-3 text-white text-opacity-75 text-sm hover:gradient-text-bp duration-300 text-center">ACCEPT</p>
              </button>
            )}
            {onRejectFriendRequest && (
              <button onClick={() => onRejectFriendRequest(receiverUid, person.uid)} className="inline-flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#2FABDD" className="ml-3 w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>


                <p className="pl-2 pr-3 text-white text-opacity-75 text-sm hover:gradient-text-pg duration-300 text-center">REJECT</p>
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

// actual friends paid
const FriendsPage: React.FC = () => {
  // list to hold your different types of frineds
  const [friendsList, setFriendsList]       = useState<FlexiblePerson[]>([]);
  const [pendingFriends, setPendingFriends] = useState<FlexiblePerson[]>([]);
  const [friendRequests, setFriendRequests] = useState<FlexiblePerson[]>([]);

  // get your friends
  const friendslist = async (query: any) => {
    const response = await fetch('/api/friends/friendList', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        searchQuery: getCookie('uid'),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save query');
    }

    const data = await response.json();
    console.log("Here are your friends: ", data.data);
    const sortedFriendsList = data.data.sort((a: { totalsets: number; }, b: { totalsets: number; }) => b.totalsets - a.totalsets);
    setFriendsList(sortedFriendsList);
  };

  // get pending friends
  const friendsPending = async (query: any) => {
    const response = await fetch('/api/friends/friendPending', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        searchQuery: getCookie('uid'),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save query');
    }

    const data = await response.json();
    console.log("Pending friends : ", data.data);
    setPendingFriends(data.data);
  };

  // get landing friends
  const friendLanding = async (query: any) => {
    const response = await fetch('/api/friends/friendLanding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        searchQuery: getCookie('uid'),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save query');
    }

    const data = await response.json();
    console.log("Here the people who have sent you a friend request: ", data.data);
    setFriendRequests(data.data);
  };

  useEffect(() => {
    friendslist("get friends list");
    friendLanding("get friend to accept/reject");
    friendsPending("get pending friend request");
  }, []);

  // accepting friend request for pending
  const handleAcceptFriendRequest = async (receiver: any, sender: any) => {
    try {
      console.log(receiver, sender);
      const response = await fetch('/api/friends/acceptFriendRequest', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ receiver, sender }),
      });

      if (!response.ok) {
        throw new Error('Failed to accept friend request');
      }

      console.log(`Friend request from ${sender} to ${receiver} accepted`);

      window.location.reload();
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  // rejecting friend request for pending
  const handleRejectFriendRequest = async (receiver: any, sender: any) => {
    try {
      const response = await fetch('/api/friends/deleteFriendRequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ receiver, sender }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject friend request');
      }

      console.log(`Friend request from ${sender} to ${receiver} rejected`);

      window.location.reload();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };

  return (
    <DefLayout>
      <div className="flex w-screen h-[88vh] justify-center items-center">
        <div className="grid grid-cols-3 gaps-5 w-[70vw]">
          {/* My Friends List */}
          <div className="px-4">
            <h2 className="mb-4 text-4xl font-bold displayheader gradient-text-bp">My Friends</h2>
            <ul className='h-[75vh] overflow-y-auto '>
              <FlexiblePersonList1 people={friendsList} />
            </ul>
          </div>

          {/* Pending Friends List */}
          <div className="px-4">
            <h2 className="mb-4 text-4xl font-bold displayheader gradient-text-pg">Pending Friends</h2>
            <ul className='h-[75vh] overflow-y-auto '>
              <FlexiblePersonList2 people={pendingFriends} />
            </ul>
          </div>

          {/* Friend Requests List */}
          <div className="px-4">
            <h2 className="mb-4 text-4xl font-bold displayheader gradient-text-gb">Friends Request</h2>
            <ul className='h-[75vh] overflow-y-auto '>
              {Array.isArray(friendRequests) && friendRequests.map(person => (
                <li key={person.uid} className="">
                  <FlexiblePersonList
                    people={[person]}
                    onAcceptFriendRequest={handleAcceptFriendRequest}
                    onRejectFriendRequest={handleRejectFriendRequest}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="h-[80vh] w-[2px] mx-[1vw] bg-white bg-opacity-50"></div>

        {/* searchbar to look for new friends */}
        <div className="">
          <div className="w-[20vw] max-h-[70vh] mb-2">
            <SearchBar />
          </div>
        </div>
      </div>

    </DefLayout>
  );
};

export default FriendsPage;