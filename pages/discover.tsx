import React, { FC, useEffect, useState } from 'react';
import DefLayout from "@/components/def_layout";
import { setCookie, getCookie } from 'cookies-next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import '@/public/styles/discover.css';

// Exercise interface for workout data
interface Exercise {
    exerciseName: string;
    numberOfReps?: number;
    numberOfSets?: number;
    weight?: number;
    eid: number;
    aid: number;
    uid: string;
    time?: string;
    notes?: string;
}

const Discover: React.FC = () => {
    const router = useRouter();

    // Definitions of workout categories
    const workouts = [
        { name: "Push", description: "A push workout targets your chest, shoulder, and triceps" },
        { name: "Pull", description: "A pull workout targets your back and biceps" },
        { name: "Legs", description: "A leg workout targets your quadriceps, hamstrings, and calves" },
        { name: "Core", description: "An abs workout targets your abdominal muscles, lower back, and obliques" },
        { name: "Cardio", description: "A cardio workout trains your aerobic metabolism and cardiovascular health" }
    ];

    type StringToArrayMappingType = {
        [key: string]: string[];
    };

    // State to handle pagination and load more functionality
    const [page, setPage] = useState(0);
    const pageSize = 20; // Number of workouts per page
    const [hasMore, setHasMore] = useState(true);

    // State for activity data and its filtering and sorting
    const [activityData, setActivityData] = useState<any[]>([]);
    
    // State to track the selected category for filtering
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    type CategorySetCounts = {
        [category: string]: number;
    };

    type MuscleGroupSetCounts = {
        [key: string]: number;
    };

    // Function to convert pounds to kilograms
    function poundsToKilograms(pounds: any) {
        return Math.round(pounds * 0.453592);
    }

    // Mapping of workout categories to muscle groups
    const workout_muscle_map: StringToArrayMappingType = {
        "Push": ["Chest", "Shoulder", "Triceps"],
        "Pull": ["Back", "Biceps"],
        "Legs": ["Quadriceps", "Hamstrings", "Calves"],
        "Core": ["Abs", "Back", "Obliques"],
        "Cardio": ["Cardio"]
    }

    // Reverse mapping from muscle groups to workout categories
    const muscleToWorkoutMap: { [muscle: string]: string } = {};
    Object.entries(workout_muscle_map).forEach(([workout, muscles]) => {
        muscles.forEach((muscle) => {
            muscleToWorkoutMap[muscle] = workout;
        });
    });


    // Fetches data for a specific exercise ID
    const ExcDatafromEID = async (query: any) => {
        try {
            const response = await fetch('/api/ExcDatafromEID', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    searchQuery: query
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to fetch exercise data');
            }
            const data = await response.json();
            return data.data.rows[0];
        } catch (error) {
            console.error('Error fetching exercise data:', error);
            return null;
        }
    };

    // Filter activities based on the selected category and set count, then sort again based on favourites
    const filteredAndSortedActivityData = activityData
        .filter(activity => {
            return selectedCategory ? activity.categorySetCounts[selectedCategory] > 5 : true;
        })
        .sort((a, b) => {
            return Math.abs(b.Favorite) - Math.abs(a.Favorite);
        });


    // Fetch and process activity data with category set counts
    const fetchData = async (pageNumber: number) => {
        try {
            const pageSize = 20;

            const response = await fetch('/api/TemplateActivities', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ page: pageNumber, size: pageSize, uid: getCookie('uid') }),
            });


            if (!response.ok) {
                throw new Error('Failed to fetch activity data');
            }
            const activityJson = await response.json();

            // Check if there is more data to load
            if (activityJson.data.length < pageSize) {
                setHasMore(false);
            }

            const activitiesWithCategorySetCounts = await Promise.all(activityJson.data.map(async (activity: any) => {
                const categorySetCounts: CategorySetCounts = {};

                const workoutResponse = await fetch('/api/TemplateWorkouts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        searchQuery: activity.Aid,
                        uid: activity.Uid
                    }),
                });
                
                if (!workoutResponse.ok) {
                    throw new Error('Failed to retrieve workouts');
                }

                // Parsing the data into usable format

                const workoutJson = await workoutResponse.json();
                const workoutsWithExerciseData = await Promise.all(workoutJson.data.rows.map(async (workout: any) => {

                    const exerciseDataResponse = await ExcDatafromEID(workout.Eid);
                    const muscleGroups = exerciseDataResponse?.muscle_group?.split(',') || [];

                    muscleGroups.forEach((muscleGroup: string) => {
                        const trimmedMuscleGroup = muscleGroup.trim();
                        const category = muscleToWorkoutMap[trimmedMuscleGroup];
                        if (category) {
                            categorySetCounts[category] = (categorySetCounts[category] || 0) + parseInt(workout.Set, 10);
                        }
                    });
                    return {
                        ...workout,
                        exerciseData: exerciseDataResponse,
                    };
                }));
                return {
                    ...activity,
                    workouts: workoutsWithExerciseData,
                    categorySetCounts,
                };
            }));
            setActivityData(prevData => [...prevData, ...activitiesWithCategorySetCounts]);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        fetchData(0);
    }, []);

    const workoutRectangleStyle = {
        border: '1px solid rgba(204, 204, 204, 0.6)',
        padding: '.5rem',
        borderRadius: '10px',
    };

    // Function to handle clicking a workout category button
    const handleCategoryClick = (categoryName: string) => {
        setSelectedCategory(prevCategory => {
            // Toggle the category off if it's already selected, or set the new one
            return prevCategory === categoryName ? null : categoryName;
        });
    };

    // Function to add a new activity
    const addActivity = async () => {
        setCookie('log', 'true');    // Set a cookie indicating that a workout is being logged

        try {
            const response = await fetch('/api/addActivity', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uid: getCookie('uid'),
                }),
            });
            if (!response.ok) throw new Error('Network response was not ok.');
        } catch (error) {
            console.error('Failed to add activity:', error);
        }
    };

    // Function to fetch the latest AID
    const fetchAid = async () => {
        const response = await fetch('/api/getAID', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                searchQuery: getCookie('uid'),
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch aid');
        }

        const data = await response.json();
        let transfAID: string | null = data.data.rows[0].Aid.toString();
        if (transfAID != null)
            localStorage.setItem('aidTransfer', transfAID);
        return parseInt(data.data.rows[0].Aid);
    };

    // Function to handle clicking on a workout template
    const handleTemplateClick = async (workoutData: any[], aid: any) => {

        updateFavorites(aid);

        // Check if an activity is being logged currently and add if not
        if (getCookie('log') === 'false') {
            await addActivity();
        }

        const templateAid = await fetchAid();

        // Create an array of exercises based on the template data
        const exerciseArray: Exercise[] = workoutData.map((item) => {
            const isMetric = getCookie('units') === 'Metric';
            const convertedWeight = isMetric ? poundsToKilograms(item.Weight) : item.Weight;

            return {
                exerciseName: item.exerciseData.name,
                numberOfReps: item.Rep,
                numberOfSets: item.Set,
                weight: convertedWeight,
                eid: item.Eid,
                aid: templateAid,
                uid: String(getCookie('uid')),
            };
        });

        // Combine the new exercises with any existing ones and store them
        const existingDataString = localStorage.getItem('exercises');
        const existingData: Exercise[] = existingDataString
            ? JSON.parse(existingDataString)
            : [];

        const combinedData = [...existingData, ...exerciseArray];

        localStorage.setItem('exercises', JSON.stringify(combinedData));

        // Navigate to the log page
        router.push('/log');
    };

    // Function to update the favorites count for an activity
    const updateFavorites = async (aid: any) => {
        const response = await fetch('/api/updateFavorites', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                Aid: aid
            }),
        });
        console.log("easy money");

        if (!response.ok) {
            throw new Error('Failed to save user');
        }
    };

// Load the next page of activities if more are available
    const handleLoadMore = () => {
        if (hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchData(nextPage);
        }
    };

    return (
        <DefLayout>
            <div className="flex flex-row w-screen min-h-[90vh] justify-center items-center">
                <div className="flex flex-col column justify-center items-center w-[20vw] h-[90vh]">
                    <h2 className="mb-4 text-[4vw] font-bold displayheader gradient-text-bp text-center">Templates</h2>
                    <div className="h-[2px] w-[3vw] mb-[2vh] bg-white bg-opacity-50"></div>
                    <div className="w-[18vw]">
                        <div className="workout-list grid grid-cols-1 gap-2">
                            {workouts.map((workout) => {
                                const isSelected = workout.name === selectedCategory;
                                const itemStyle = isSelected
                                    ? { ...workoutRectangleStyle, background: "rgba(85, 187, 164, .60)" }
                                    : workoutRectangleStyle;

                                return (
                                    <div key={workout.name} className="" style={itemStyle} onClick={() => handleCategoryClick(workout.name)}>
                                        <div className="">
                                            <p className="text-xl font-bold">
                                                {workout.name}
                                            </p>
                                            <p className="text-xs">{workout.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="h-[80vh] w-[2px] mx-[1vw] bg-white bg-opacity-50"></div>

                <div className="flex flex-col column px-[1vw] w-[73vw] h-[80vh] items-center" style={{ overflowY: 'auto' }}>
                    <div className="w-[70vw]">
                        <ul className="">
                            {filteredAndSortedActivityData.map((activity: any, i: number) => (
                                <li key={i} className="border-b border-white p-5 border-opacity-50">
                                    <div className="">
                                        <div className="grid grid-cols-6 gap-2">

                                            <div className='flex flex-row items-center  col-span-2'>

                                                {activity.Favorite <= -1 ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#C32E67" className="w-6 h-6 mr-1">
                                                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                                    </svg>
                                                    )
                                                    :
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#2FABDD" className="w-6 h-6 mr-1">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                                </svg> 
                                                }

                                                <div className="mr-3">{Math.abs(activity.Favorite)}</div>
                                                <h2 className="text-2xl font-bold displayheader gradient-text-pg overflow-x-auto flex flex-row items-center">
                                                    {activity.Activity_name}
                                                    {activity.friend_name && <span className="ml-2 text-sm">(by {activity.friend_name})</span>}
                                                </h2>
                                            </div>

                                            <span className='flex flex-row items-center overflow-x-auto col-span-3 items-center opacity-70'>


                                                {Object.entries(activity.categorySetCounts).map(([category, count]) => (
                                                    <>
                                                        {/* Display the aggregated set counts by category */}
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#55BBA4" className="w-8 h-8 mr-2 pl-2">
                                                            <path stroke-linecap="round" stroke-linejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
                                                        </svg>

                                                        <div className='mr-2' key={category}>{category}: {Number(count)}</div>
                                                    </>
                                                ))}
                                            </span>

                                            <div className='col-span-1 flex flex-row items-center'>
                                                <button onClick={() => {
                                                    if (activity && activity.workouts) {
                                                        handleTemplateClick(activity.workouts, activity.Aid);
                                                    } else {
                                                        console.log("No workout data to save");
                                                        // Optionally, you could display a notification or alert to the user here.
                                                    }
                                                }} className="template-button">
                                                    <p className="pl-3 text-white text-opacity-75 text-sm hover:gradient-text-bp duration-300 text-center">USE AS TEMPLATE</p>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <ul className="workout-list">
                                        <div className="grid grid-cols-5 gap-1 px-5 mt-2 mb-2 pt-3 border-t border-white border-opacity-30">
                                            <div className="col-span-2"></div>
                                            <div className="flex flex-row text-md text-left items-center opacity-70">
                                                <Image
                                                    src="/animated/set.svg"
                                                    alt=""
                                                    width={40}
                                                    height={40}
                                                />
                                                <div className="ml-2">Sets:</div>
                                            </div>
                                            <div className="flex flex-row text-md text-left items-center opacity-70">
                                                <Image
                                                    src="/animated/rep.svg"
                                                    alt=""
                                                    width={40}
                                                    height={40}
                                                />
                                                <div className="ml-2">Reps: </div>
                                            </div>
                                            <div className="flex flex-row text-md text-left items-center opacity-70">
                                                <Image
                                                    src="/animated/weight.svg"
                                                    alt=""
                                                    width={40}
                                                    height={40}
                                                />
                                                <div className="ml-2">Weight:</div>
                                            </div>
                                        </div>
                                        {activity.workouts.map((workout: any, j: number) => (
                                            <li key={j} className="workout-item">
                                                <div className="grid grid-cols-5 gap-1 px-5 mb-2">
                                                    <div className="text-lg text-left px-2 opacity-80 col-span-2">{workout.exerciseData.name}</div>
                                                    <div className="flex flex-row text-md text-left items-center opacity-70">
                                                        <div className="ml-2">{workout.Set}</div>
                                                    </div>
                                                    <div className="flex flex-row text-md text-left items-center opacity-70">
                                                        <div className="ml-2">{workout.Rep}</div>
                                                    </div>
                                                    <div className="flex flex-row text-md text-left items-center opacity-70">
                                                        <div className="ml-2">{getCookie('units') === 'Metric' ? poundsToKilograms(workout.Weight) : workout.Weight}</div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            ))}
                        </ul>


                    </div>
                    {/* Load More Button */}
                    <div className="grid grid-cols-3 gap-2 w-[70vw]">
                        <h2 className=""></h2>

                        <div className='flex flex-row items-center justify-center'>
                            <button onClick={handleLoadMore} className="text-center hover:gradient-text-gb duration-300 p-2 mt-5 flex flex-row mb-4 border border-white rounded-md border-opacity-50 bg-white bg-opacity-10">
                                Load More
                            </button>
                        </div>

                        <div className="">

                        </div>
                    </div>

                </div>

            </div>
        </DefLayout >
    );
}

export default Discover;