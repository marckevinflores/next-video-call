import { useSocket } from '@/context/socket';
import usePeer from '@/hooks/usePeer';
import useMediaStream from '@/hooks/useMediaStream';
import Player from '@/component/Player';
import Controls from '@/component/Controls';
import { useEffect, useState } from 'react';
import usePlayer from '@/hooks/usePlayer';
import styles from '@/styles/room.module.css';
import { useRouter } from 'next/router';
import { cloneDeep } from 'lodash';
import LinkCopy from '@/component/LinkCopy';

const Room = () => {
  const socket = useSocket();
  const router = useRouter();
  const { roomId } = router.query;
  const { peer, myId } = usePeer();
  const { stream } = useMediaStream();
  const {
    players,
    setPlayers,
    playerHighlighted,
    nonHighlightedPlayers,
    toggleAudio,
    toggleVideo,
    leaveRoom,
  } = usePlayer(myId, roomId, peer);

  const [users, setUsers] = useState([]);



  useEffect(() => {
    // call this useEffect when there is a new user
    if (!socket || !peer || !stream) return;
    const handleUserConnected = (newUser) => {
      const call = peer.call(newUser, stream);
      call.on('stream', (incomingStream) => {
        setPlayers((prev) => ({
          ...prev,
          [newUser]: {
            url: incomingStream,
            muted: true,
            playing: true,
          },
        }));

        setUsers((prev) => ({
          ...prev,
          [newUser]: call,
        }));
      });
    };
    socket.on('user-connected', handleUserConnected);
    return () => {
      socket.off('user-connected', handleUserConnected);
    };
  }, [peer, setPlayers, socket, stream]);



  useEffect(() => {
    // calling this useEffect when the user clicks the audio, video or end call from controls
    if (!socket) return;
    const handleToggleAudio = (userId) => {
      setPlayers((prev) => {
        const copy = cloneDeep(prev);
        copy[userId].muted = !copy[userId].muted;
        return { ...copy };
      });
    };

    const handleToggleVideo = (userId) => {
      setPlayers((prev) => {
        const copy = cloneDeep(prev);
        copy[userId].playing = !copy[userId].playing;
        return { ...copy };
      });
    };
    const handleUserLeave = (userId) => {
      users[userId]?.close();
      const playersCopy = cloneDeep(players);
      delete playersCopy[userId];
      setPlayers(playersCopy);
    };
    socket.on('user-toggle-audio', handleToggleAudio);
    socket.on('user-toggle-video', handleToggleVideo);
    socket.on('user-leave', handleUserLeave);
    return () => {
      socket.off('user-toggle-audio', handleToggleAudio);
      socket.off('user-toggle-video', handleToggleVideo);
      socket.off('user-leave', handleUserLeave);
    };
  }, [players, setPlayers, socket, users]);

  useEffect(() => {
    //call this effect when there is a incoming stream
    if (!peer || !stream) return;
    peer.on('call', (call) => {
      const { peer: callerId } = call;
      call.answer(stream);
      call.on('stream', (incomingStream) => {
        console.log(Object.keys(players).length);
        console.log(`incoming stream from ${callerId}`);
        setPlayers((prev) => ({
          ...prev,
          [callerId]: {
            url: incomingStream,
            muted: true,
            playing: true,
          },
        }));
        setUsers((prev) => ({
          ...prev,
          [callerId]: call,
        }));
      });
    });
  }, [peer, setPlayers, stream, players, users]);


  useEffect(() => {
    // settings of your stream when you join
    if (!stream || !myId) return;
    setPlayers((prev) => ({
      ...prev,
      [myId]: {
        url: stream,
        muted: true,
        playing: true,
      },
    }));
  }, [myId, setPlayers, stream]);


  useEffect(() => {
    // call this useEffect when the server knows the participants are more than the limit
    if (!socket) return;
    const handleRoomFull = () => {
      alert('The room is full. Unable to join.');
      leaveRoom();
    };
    socket.on('room-full', handleRoomFull);
    return () => {
      socket.off('room-full', handleRoomFull);
    };
  }, [socket, router, leaveRoom]);

  useEffect(() => {
    // call this useEffect when the user close the browser
    const handleTabClosing = () => {
      leaveRoom();
   }

   const alertUser = (event) => {
      event.preventDefault()
      event.returnValue = ''
   }
   
    window.addEventListener('beforeunload', alertUser)
    window.addEventListener('unload', handleTabClosing)
    return () => {
        window.removeEventListener('beforeunload', alertUser)
        window.removeEventListener('unload', handleTabClosing)
    }
})
  return (
    <>
      <div className={styles.activePlayerContainer}>
        {playerHighlighted && (
          <Player
            key={playerHighlighted.playerId}
            url={playerHighlighted.url}
            muted={playerHighlighted.muted}
            playing={playerHighlighted.playing}
            isActive
          />
        )}
      </div>
      <div className={styles.inActivePlayerContainer}>
        {Object.keys(nonHighlightedPlayers).map((playerId) => {
          const { url, muted, playing } = nonHighlightedPlayers[playerId];
          return (
            <Player
              key={playerId}
              url={url}
              muted={muted}
              playing={playing}
              isActive={false}
            />
          );
        })}
      </div>
      <LinkCopy roomId={roomId} />
      <Controls
        muted={playerHighlighted?.muted}
        playing={playerHighlighted?.playing}
        toggleAudio={toggleAudio}
        toggleVideo={toggleVideo}
        leaveRoom={leaveRoom}
      />
    </>
  );
};
export default Room;
