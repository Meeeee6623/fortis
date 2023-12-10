import asyncio
import concurrent.futures
import random

import pandas as pd
import psycopg2

# Database Connection Parameters
DB_HOST = "ep-green-bird-78301737-pooler.us-east-1.postgres.vercel-storage.com"
DB_NAME = "verceldb"
DB_USER = "default"
DB_PASSWORD = "RcXhD7Ag9wUV"


def upload_activity(activity, conn):
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO activity VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
                       (activity['Activity_name'], activity['Aid'], activity['Uid'], activity['Date'],
                        activity['Start_time'], activity['End_time'], activity['Duration'], activity['Favorite']))
        conn.commit()
    except Exception as e:
        conn.rollback()
        print(e)
        print(f"Error uploading activity {activity['Aid']} for user {activity['Uid']}")


def upload_activities(activities, names, conn):
    for activity in activities:
        print(f"Uploading activity {activity['Aid']} for user {activity['Uid']}")
        # Columns: Activity_name, Aid, Uid, Date, Start_time, End_time, Duration, Favorite
        # get random activity name from names.txt and push, pull, leg, run, swim
        name = random.choice(names) + ' ' + random.choice(['push', 'pull', 'leg', 'run', 'swim'])
        activity['Activity_name'] = name
        date = activity['Date']
        activity['Start_time'] = date + ' ' + activity['Start_time'] + '.000000'
        activity['End_time'] = date + ' ' + activity['End_time'] + '.000000'

        # upload to activity table
        upload_activity(activity, conn)

def upload_workout(workout, conn):
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO workouts VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
                       (workout['Uid'], workout['Aid'], workout['Seq_num'], workout["Eid"], workout['Weight'],
                        workout['Rep'],
                        workout['Set'], workout['Time'], workout['Notes']))
        conn.commit()
    except Exception as e:
        print(f"Error: {e}")
        print(f"Error uploading workout {workout['Seq_num']} for user {workout['Uid']}")
        conn.rollback()


def upload_workouts(workouts, names, conn):
    for workout in workouts:
        print(f"Uploading workout {workout['Seq_num']}")
        # columns: Uid, Aid, Seq_num, Weight, Rep, Set, Time, Notes
        add_note = random.choices([True, False], weights=[.05, .95], k=1)
        if add_note:
            workout['Notes'] = random.choice(['good', 'bad', 'mid', 'ok', 'great', 'terrible', 'amazing', 'awful'])
        else:
            workout['Notes'] = ''
        add_time = random.choices([True, False], weights=[.05, .95], k=1)
        if add_time:
            workout['Time'] = random.randint(0, 100)
        else:
            workout['Time'] = 0
        # upload to work out table
        upload_workout(workout, conn)
        # with concurrent.futures.ThreadPoolExecutor() as executor:
        #     for workout in workouts:
        #         executor.submit(upload_workout, workout, conn)



def main():
    # Establish Database Connection
    def get_db_connection():
        return psycopg2.connect(host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASSWORD)

    conn = get_db_connection()

    activities = pd.read_csv('activities.csv', header=0)
    activities_dict = activities.to_dict(orient='records')
    workouts = pd.read_csv('workouts.csv', header=0)
    workouts_dict = workouts.to_dict(orient='records')
    with open('names.txt') as f:
        names = f.read().splitlines()
    # upload_activities(activities_dict, names, conn)
    upload_workouts(workouts_dict, names, conn)


if __name__ == '__main__':
    main()
