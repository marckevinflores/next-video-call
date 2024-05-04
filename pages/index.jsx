import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/router';
import { useState } from 'react';
import styles from '@/pages/index.module.css'
export default function Home() {
  const router = useRouter();
  const [roomId, setRoomId] = useState('');
  const createAndJoin = () => {
    const roomId = uuidv4();
    router.push(`/${roomId}`);
  };
  const joinRoom = () => {
    if (roomId) router.push(`/${roomId}`);
    else {
      alert('Please provide a valid room id');
    }
  };
  return (
    <div className={styles.login}>
      <h1 className='text-2xl mb-4'>Video Call Demo</h1>
        <input className={styles.formInput}
          placeholder='Enter Room ID'
          value={roomId}
          onChange={(e) => setRoomId(e?.target?.value)}
        />
        <button className={styles.formButton} onClick={joinRoom}>Join Room</button>
      <span>------------- or ------------</span>
      <button onClick={createAndJoin} className={styles.formButton} >Create a new room</button>
    </div>
  );
}
