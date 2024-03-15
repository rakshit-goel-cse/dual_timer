import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Constant } from "./components/Constants";
import { WorkTimer } from "./components/WorkTimer";
import { ResetTimer } from "./components/RestTimer";
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';

let timeoutId=null;
export default function App() {
  const [state, setState] = useState(Constant.reset);
  const [WorkTime, setWorkTime] = useState(0);
  const [RestTime, setRestTime] = useState(0);
  const [timerState, setTimerState] = useState(Constant.timerWork);
  const [timeArray, setTimeArray] = useState([0,0]);
  const [soundLoc,setSoundLoc]= useState(null);
  const [sound, setSound] = useState();

  useEffect(() => {
    async function loadSound() {
      try{
      let sound ;
      if(soundLoc && soundLoc.uri){
        const tempSound = await Audio.Sound.createAsync(
          { uri: soundLoc.uri },
          { shouldPlay: false }
        );
        sound=tempSound.sound;
      }else{
        const tempSound = await Audio.Sound.createAsync(
        require("./assets/defaultTone.mp3")
      );
      sound=tempSound.sound;
      }
      console.log("Sound- ",sound);
      setSound(sound);
  } catch (error) {
    console.error('Failed to load sound:', error); // Log error if sound loading fails
  }
    }
    loadSound();

    return () => {
      if (sound) {
        console.log("reset sound");
       // sound.unloadAsync(); // Unload the sound when the component unmounts
      }
    };
  }, [soundLoc]);

  const playSound = async () => {
    if (sound) {
      await sound.playAsync(); // Replay the sound
    }
  };

  const stopSound = async () => {
    if (sound) {
      await sound.stopAsync(); // Stop the sound
    }
  };

  useEffect(() => {
    let interval;
    if (state == Constant.start) {
      clearInterval(interval);
      interval = setInterval(() => {
        //console.info("timer state- ",timerState," , ",state);
        if(state == Constant.reset){
          clearInterval(interval);
        }
        //Work
        else if(timerState==Constant.timerWork){
          setWorkTime(prevWorkTime => {
            if (prevWorkTime > 1) {
                return prevWorkTime - 1;
            } else {
                Swap();
                return 0;
            }
        });
      }
        //rest
        else if(timerState==Constant.timerBreak){
          setRestTime(prevRestTime => {
            if (prevRestTime > 1) {
                return prevRestTime - 1;
            } else {
                Swap();
                return 0;
            }
        });
      }
      else{
        clearInterval(interval);
      }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerState,state]);

const swapLogic=()=>{
  console.log(state==Constant.start);
  if(state==Constant.start){
    if(timerState==Constant.timerWork){
      setTimerState(Constant.timerBreak);
      setWorkTime(timeArray[0]);
    }
    else if(timerState==Constant.timerBreak){
      setTimerState(Constant.timerWork);
      setRestTime(timeArray[1]);
    } 
  }
}

  const Swap = () =>{
    playSound(); // Set playSound to true to trigger sound playback
    setTimeout(() => {
      stopSound(); // Set playSound back to false after 5 seconds to stop the sound
      swapLogic();
    }, 3000);    
  }
  
  const StartPause = () => {
    if (WorkTime > 0 && RestTime > 0) {
      if(state == Constant.start){
         setState(Constant.pause)
      }
      else if(state == Constant.pause){
        setState(Constant.start)
     }else{
          setState(Constant.start);
          setTimeArray([WorkTime,RestTime]);
      }
    }
  };

  const Reset = () => {
    //console.log("reset");
    clearTimeout();
    setTimeArray([0,0]);
    setWorkTime(0);
    setRestTime(0);
    setState(Constant.reset);
    setTimerState(Constant.timerWork);
  };

    const FilePicker = async () => {
      try {
        const res = await DocumentPicker.getDocumentAsync({
          type: 'audio/*',
        });
        setSoundLoc(res.assets[0]);
        console.log('Selected file:', res.assets[0]);
      } catch (err) {
          console.error('Error while selecting the file:', err);
        }
      }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <TouchableOpacity style={styles.LocText}
        onPress={()=>FilePicker()}>
          <Text>{soundLoc?soundLoc.name:"Default"}</Text>
        </TouchableOpacity>
        
        <View style={{flex:5,justifyContent:"space-between",alignItems:"center"}}>
        <WorkTimer time={WorkTime} setTime={setWorkTime} state={state} timerState={timerState} swap={Swap}/>
        <Text style={styles.StateText}>{timerState==Constant.timerBreak?"Break":"Work"}</Text>
        <ResetTimer time={RestTime} setTime={setRestTime} state={state} timerState={timerState} swap={Swap}/>
        </View>

        <View
          style={{
            //position: "absolute",
            //bottom: 0, // Positioned at the bottom of the screen
            //left: 0, // Aligning it to the left edge
            //right: 0, // Aligning it to the right edge
            flex:1,
            justifyContent: "space-between",
            flexDirection: "row",
            maxHeight: 50,
            marginBottom: 20,
          }}
        >
          <TouchableOpacity
            onPress={() => Reset()}
            style={{
              backgroundColor: state == Constant.reset ? "grey" : "red",
              color: "white",
              width: 50,
              height: 50,
              borderRadius: 60,
              justifyContent: "center",
              alignItems: "center",
              margin: 10,
            }}
          >
            <Text>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => StartPause()}
            style={{
              ...styles.StartPause,
              backgroundColor: state == Constant.start ? "yellow" : "green",
            }}
          >
            <Text>{state == Constant.start ? "Pause" : "Start"}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  StartPause: {
    color: "white",
    width: 50,
    height: 50,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
  },
  StateText:{
    
  },
  LocText:{
    flex:1,
    maxHeight: 50,
    alignSelf:"center",
  }
});
