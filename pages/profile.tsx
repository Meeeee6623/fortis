import Image from 'next/image';
import Link from 'next/link';
import DefLayout from '@/components/def_layout';
import React, { FC, useState, useEffect } from 'react';
import { setCookie, getCookie } from 'cookies-next';
import { useRouter } from 'next/router';
import DeleteConfirmation from '@/components/DeleteConfirmation';
import '@/public/styles/profile.css';     // style sheet for animations

const ProfilePage: React.FC = () => {
  // set states for display
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState(30);
  const [height, setHeight] = useState(175);  // in inches
  const [weight, setWeight] = useState(70);   // in lb
  const [gender, setGender] = useState('Male');
  const [units, setUnits] = useState('Imperial');
  const [privacy, setPrivacy] = useState("Public");
  const [about, setAbout] = useState('');

  // get userdata
  // get userdata from uid
  useEffect(() => {
    const fetchData = async () => {
      try {

        const response = await fetch('/api/getNamefromUID', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            searchQuery: getCookie('uid'),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get UID from email');
        }

        const data = await response.json();

        const userdata = data.data.rows[0];

        setName(userdata.name);
        setAge(userdata.age);
        setGender(userdata.gender);
        setUnits(userdata.unit);
        setPrivacy(userdata.privacy);
        setAbout(userdata.about);

        const inchesToCm = (inches: any) => inches * 2.54;      // Conversion factor: 1 inch = 2.54 cm
        const poundsToKg = (pounds: any) => pounds * 0.453592;  // Conversion factor: 1 lb = 0.453592 kg

        if (userdata.unit === 'Metric') {
          // Convert height from inches to centimeters
          const heightInCm = inchesToCm(userdata.height);

          // Convert weight from pounds to kilograms
          const weightInKg = poundsToKg(userdata.weight);

          // Set the state with converted values
          setHeight(Math.round(heightInCm));
          setWeight(Math.round(weightInKg));
        } else {
          // If units are not Metric, use the values as is
          setHeight(userdata.height);
          setWeight(userdata.weight);
        }

        return userdata;
      }
      catch (err) {
        console.log('Error in GetUIDfromEmail:', err);
      }

      try {
        const response = await fetch('/api/getEmailfromUID', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            searchQuery: getCookie('uid'),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get UID from email');
        }

        const data = await response.json();
        setEmail(data.data.rows[0].email);
        return data.data.rows[0].email;
      }
      catch (err) {
        console.log('Error in GetUIDfromEmail:', err);
      }
    };

    fetchData();
  }, []);

  // get user email data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/getEmailfromUID', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            searchQuery: getCookie('uid'),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get UID from email');
        }

        const data = await response.json();
        setEmail(data.data.rows[0].email);
        return data.data.rows[0].email;
      }
      catch (err) {
        console.log('Error in GetUIDfromEmail:', err);
      }
    };

    fetchData();
  }, []);

  // char limit for about me
  const characterLimit = 500;

  // Define state variables to track edit mode
  const [isEditing, setIsEditing] = useState(false);
  const handleEditClick = (reload: boolean) => {
    setIsEditing(!isEditing);

    if (reload) {
      window.location.reload();
    }
  };

  // handle update user
  const handleUpdateUserData = async () => {
    handleEditClick(false);

    let heightToSend = height;
    let weightToSend = weight;

    if (units === 'Metric') {
      // Convert height from centimeters to inches for Imperial units
      heightToSend = Math.round(height / 2.54);

      // Convert weight from kilograms to pounds for Imperial units
      weightToSend = Math.round(weight / 0.453592);
    }

    setCookie('units', units);

    try {
      const response = await fetch('/api/updateUserData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: getCookie('uid'),
          name: name,
          age: age,
          height: heightToSend,
          weight: weightToSend,
          gender: gender,
          units: units,
          privacy: privacy,
          about: about
        }),
      });

      if (response.status === 200) {
        console.log('User data updated successfully');
      } else {
        console.error('Failed to update user data');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // convert units if they change unit
  const setUnitsAndConvert = (newUnits: any) => {
    if (units === 'Imperial' && newUnits === 'Metric') {
      // Convert height from inches to centimeters
      const heightInCm = height * 2.54; // Conversion factor: 1 inch = 2.54 cm

      // Convert weight from pounds to kilograms
      const weightInKg = weight * 0.453592; // Conversion factor: 1 lb = 0.453592 kg

      // Update the state with converted values
      setHeight(Math.round(heightInCm));
      setWeight(Math.round(weightInKg));
    } else if (units === 'Metric' && newUnits === 'Imperial') {
      // Convert height from centimeters to inches
      const heightInInches = height / 2.54; // Conversion factor: 1 cm = 0.393701 inches

      // Convert weight from kilograms to pounds
      const weightInLb = weight / 0.453592; // Conversion factor: 1 kg = 2.20462 lb

      // Update the state with converted values
      setHeight(Math.round(heightInInches));
      setWeight(Math.round(weightInLb));
    }
    
    // Set the units state
    setUnits(newUnits);
  };

  // handle changing about me (also with 500 character limit)
  const handleTextareaChange = (e: any) => {
    if (e.length <= characterLimit) {
      setAbout(e);
    }
  };
  
  // handle delete
  // to reroute
  const router = useRouter();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const handleDelete = () => {
    // Show the confirmation dialog
    setShowConfirmation(true);
  };
  const handleCancelDelete = () => {
    // Hide the confirmation dialog
    setShowConfirmation(false);
  };
  const handleConfirmDelete = async () => {
    setShowConfirmation(false); // Hide the confirmation dialog after successful deletion
    await deleteUser();
    await setCookie('uid', 'no id');
    router.push('/api/auth/logout');
  };

  // fun to delete user
  const deleteUser = async () => {
    try {
      const response = await fetch('/api/deleteUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: getCookie('uid'),
        }),
      });

      if (response.status === 200) {
        console.log('User deleted  successfully');
      } else {
        console.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // handle changes to name -- limit to 70
  const handleNameChange = (e:any) => {
    const inputValue = e.target.value;

    const nameLimit = 70;
    if (inputValue.length <= nameLimit) {
      setName(inputValue);
    }
  };

  return (
    <DefLayout>
      <div className="flex w-screen min-h-[90vh] justify-center items-center">
        <div className="flex flex-col h-[85vh] w-[70vw] overflow-y-auto bg-white bg-opacity-5 rounded-3xl border border-white border-opacity-40 p-5">
          <div className='text-6xl font-bold gradient-text-gb displayheader'>About</div>
          <div className="h-[2px] w-[4vw] bg-white bg-opacity-70 mt-2 mb-5"></div>
          <div>
            {isEditing ? (
              <div>
                <textarea
                  value={about}
                  onChange={(e) => handleTextareaChange(e.target.value)}
                  className="w-full text-left opacity-75 resize-y"
                  rows={20} // Set the number of visible rows initially to 20
                />
                <p>
                  Character Count: {about.length}/{characterLimit}
                </p>
              </div>
            ) : (
              <textarea
                value={`${about !== null ? about : '-'}`}
                className="w-full text-left opacity-75 resize-y"
                rows={20} // Set the number of visible rows initially to 20
              />
            )}
          </div>
        </div>

        <div className="h-[80vh] w-[2px] mx-[1vw] bg-white bg-opacity-50"></div>

        <div className="flex flex-col h-[85vh] w-[25vw] items-center">
          <div className="mb-4">
            <div>
              {isEditing ? (
                <div className="flex flex-row justify-between opacity-75">
                  <input
                    type="text"
                    className="w-[20vw] text-5xl font-bold displayheader opacity-75"
                    value={name}
                    onChange={(e) => handleNameChange(e)}
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                  </svg>
                </div>
              ) : (
                <div className='text-6xl font-bold gradient-text-gb displayheader text-center'>{name}</div>
              )}
            </div>
          </div>

          <div className="h-[2px] w-[22vw] bg-white bg-opacity-50 mb-5"></div>

          <div className="grid grid-cols-4 gap-1 w-[18vw]">
            <div className="col-span-1">
              <strong>Email:</strong>
            </div>
            <div className="col-span-3 text-right overflow-x-auto">
              {email}
            </div>

            <div className="col-span-1">
              <strong>Age:</strong>
            </div>
            <div className="col-span-3 text-right text-right">
              {isEditing ? (
                <input
                  type="number"
                  value={age}
                  onChange={(e) => Number(e.target.value) >= 0 ? setAge(Number(e.target.value)) : null}
                  className="w-full text-right opacity-75"
                />
              ) : (
                `${age !== null ? age : '-'}`
              )}
            </div>

            <div className="col-span-1">
              <strong>Height:</strong>
            </div>
            <div className="col-span-3 text-right text-right">
              {isEditing ? (
                <div className="flex flex-row opacity-75">
                  <input
                    type="number"
                    value={height !== null ? height : ''}
                    onChange={(e) => Number(e.target.value) >= 0 ? setHeight(Number(e.target.value)) : null}
                    className="w-full text-right"
                  />
                  <div className="ml-1">{units === 'Imperial' ? 'in' : 'cm'}</div>
                </div>
              ) : (
                (height !== null ? `${height} ${units === 'Imperial' ? 'in' : 'cm'}` : `-${units === 'Imperial' ? 'in' : 'cm'}`)
              )}
            </div>

            <div className="col-span-1">
              <strong>Weight:</strong>
            </div>
            <div className="col-span-3 text-right text-right">
              {isEditing ? (
                <div className="flex flex-row opacity-75">
                  <input
                    type="number"
                    value={weight !== null ? weight : ''}
                    onChange={(e) => Number(e.target.value) >= 0 ? setWeight(Number(e.target.value)) : null}
                    className="w-full text-right"
                  />
                  <div className="ml-1">{units === 'Imperial' ? 'lb' : 'kg'}</div>
                </div>
              ) : (
                (weight !== null ? `${weight} ${units === 'Imperial' ? 'lb' : 'kg'}` : `-${units === 'Imperial' ? 'lb' : 'kg'}`)
              )}
            </div>

            <div className="col-span-1">
              <strong>Gender:</strong>
            </div>
            <div className="col-span-3 text-right">
              {isEditing ? (
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full opacity-75"
                >
                  <option value="{null}">-</option>
                  <option value="Man">Man</option>
                  <option value="Woman">Woman</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                `${gender !== null ? gender : '-'}`
              )}
            </div>

            <div className="col-span-1">
              <strong>Units:</strong>
            </div>
            <div className="col-span-3 text-right">
              {isEditing ? (
                <select value={units} onChange={(e) => setUnitsAndConvert(e.target.value)} className=" opacity-75" >
                  <option value="Imperial">Imperial</option>
                  <option value="Metric">Metric</option>
                </select>
              ) : (
                units
              )}
            </div>

            <div className="col-span-1">
              <strong>Privacy:</strong>
            </div>
            <div className="col-span-3 text-right">
              {isEditing ? (
                <select value={privacy} onChange={(e) => setPrivacy(e.target.value)} className=" opacity-75">
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                </select>
              ) : (
                privacy
              )}

            </div>
          </div>

          <div className="h-[2px] w-[22vw] bg-white bg-opacity-50 my-5"></div>

          <div className='p-2 mt-3 flex flex-row mb-4 border border-white rounded-md border-opacity-50 bg-white bg-opacity-10'>
            <button
              onClick={() => handleEditClick(isEditing)}
              className="inline-flex items-center border-r"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#2FABDD" className="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
              </svg>

              <p className="pl-2 pr-3 text-white text-opacity-75 text-md hover:gradient-text-bp duration-300 text-center">
                {isEditing ? 'CANCEL' : 'EDIT'}
              </p>
            </button>
            {isEditing ?
              <button
                onClick={handleUpdateUserData}
                className="inline-flex items-center pl-3"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#C32E67" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                </svg>
                <p className="pl-2 pr-3 text-white text-opacity-75 text-md hover:gradient-text-pg duration-300 text-center">SAVE CHANGES</p>
              </button>
              :
              <div className="inline-flex items-center pl-3">
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center pl-3"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#C32E67" className="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                  </svg>

                  <p className="pl-2 pr-3 text-white text-opacity-75 text-md hover:gradient-text-pg duration-300 text-center">DELETE ACCOUNT</p>
                </button>
                {showConfirmation && (
                  <DeleteConfirmation onCancel={handleCancelDelete} onConfirm={handleConfirmDelete} />
                )}
              </div>
            }
          </div>

        </div>
      </div>

    </DefLayout>
  );
};

export default ProfilePage;