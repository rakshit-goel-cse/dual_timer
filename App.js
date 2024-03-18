import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Keyboard, TouchableWithoutFeedback } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Constant } from "./components/Constants";
import { WorkTimer } from "./components/WorkTimer";
import { ResetTimer } from "./components/RestTimer";
import * as DocumentPicker from "expo-document-picker";
import { Audio } from "expo-av";

let interval=null;
let intervalGap=null;
export default function App() {
  const [state, setState] = useState(Constant.reset);
  const [WorkTime, setWorkTime] = useState(0);
  const [RestTime, setRestTime] = useState(0);
  const [timerState, setTimerState] = useState(Constant.timerWork);
  const [timeArray, setTimeArray] = useState([0, 0]);
  const [soundLoc, setSoundLoc] = useState(null);
  const [sound, setSound] = useState();
  const [gapTime, setGapTime] = useState(3);
  const ref = useRef(null);

  useEffect(() => {
    /*const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setIsKeyboardOpen(true)
    );*/
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        console.log("keyboard Closed- ",gapTime);
        if(parseInt(gapTime)<2){setGapTime(2)}
      }
    );
    // Clean up listeners
    return () => {
      //keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [gapTime]);

  useEffect(() => {
    async function loadSound() {
      try {
        let sound;
        if (soundLoc && soundLoc.uri) {
          const tempSound = await Audio.Sound.createAsync(
            { uri: soundLoc.uri },
            { shouldPlay: false }
          );
          sound = tempSound.sound;
        } else {
          const tempSound = await Audio.Sound.createAsync(
            require("./assets/defaultTone.mp3")
          );
          sound = tempSound.sound;
        }
        setSound(sound);
      } catch (error) {
        console.error("Failed to load sound:", error); // Log error if sound loading fails
      }
    }
    loadSound();

    return () => {
      if (sound) {
        sound.unloadAsync(); // Unload the sound when the component unmounts
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
    //let interval;
    //let secondd=2;
    interval ? clearInterval(interval) : '';
    if (state == Constant.start) {
      
      interval = setInterval(() => {
        //console.log(secondd);
        //secondd--;
        if (state == Constant.reset) {
          clearInterval(interval);
          //Reset();
        }
        //Work
        //else if(secondd<=0){
          
          //console.log(timerState);
          if (timerState == Constant.timerWork) {
          setWorkTime((prevWorkTime) => {
            if (prevWorkTime > 1) {
              return prevWorkTime - 1;
            } else {
              clearInterval(interval);
              Swap();
              return 0;
            }
          });
        }
        //rest
        else if (timerState == Constant.timerBreak) {
          setRestTime((prevRestTime) => {
            //console.log("prev time- ",prevRestTime);
            if (prevRestTime > 1) {
              return prevRestTime - 1;
            } else {
              //console.info("rest time over");
              clearInterval(interval);
              Swap();
              return 0;
            }
          });
        } else {
          clearInterval(interval);
        }
        //secondd=2;
      //}
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerState, state]);

  const swapLogic = () => {
    //console.log("Swap logic-",state,timerState);
    if (state === Constant.start) {
      if (timerState === Constant.timerWork) {
        setTimerState(Constant.timerBreak);
        setWorkTime(timeArray[0]);
      } else if (timerState === Constant.timerBreak) {
        setTimerState(Constant.timerWork);
        //console.log("setting work state- ",timerState);
        setRestTime(timeArray[1]);
      }
    }
  };

  const Swap = () => {
    playSound(); // Set playSound to true to trigger sound playback
    let rangeGap=2*parseInt(gapTime);
    //console.log('swap interval called');
    intervalGap = setInterval(() => {
      if(state === Constant.reset || state === Constant.pause || rangeGap <= 1){
        //console.trace("stopping interval- ",intervalGap);
        clearInterval(intervalGap);
        //console.trace("stopping interval stoped- ",intervalGap);
        stopSound(); // Set playSound back to false after 5 seconds to stop the sound
      swapLogic();
      }
      rangeGap--;
    }, 500);
  };

  const StartPause = () => {
    if (WorkTime > 0 && RestTime > 0) {
      if (state == Constant.start) {
        setState(Constant.pause);
      } else if (state == Constant.pause) {
        setState(Constant.start);
      } else {
        setState(Constant.start);
        setTimeArray([WorkTime, RestTime]);
      }
    }
  };

  const Reset = () => {
    //console.log(state);
    if(interval){clearTimeout( interval); interval=null;}
    if(intervalGap){clearTimeout( intervalGap); intervalGap=null;stopSound();}
    setTimeArray([0, 0]);
    setRestTime(0);
    setWorkTime(0);
    setState(Constant.reset);
    setTimerState(Constant.timerWork);
  };

  const FilePicker = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
      });
      setSoundLoc(res.assets[0]);
    } catch (err) {
      console.error("Error while selecting the file:", err);
    }
  };

  return (
    <SafeAreaProvider>
      <TouchableWithoutFeedback onPress={()=>Keyboard.dismiss()}>
      <SafeAreaView style={{ flex: 1, backgroundColor:"#6C0BA9" }}>
        
      <View style={styles.header}>
        <TouchableOpacity style={styles.LocText} onPress={() => FilePicker()}>
          <Text style={{color:"yellow",}}>{soundLoc ? soundLoc.name : "Default"}</Text>
        </TouchableOpacity>
        {/*cancel selected Tone*/}
        {soundLoc && (
        <TouchableOpacity style={styles.CrossText} onPress={() => state==Constant.reset ? setSoundLoc(null):null} >
          <Text style={{color:"black",fontSize:17}}>X</Text>
        </TouchableOpacity>
        )}

        <TextInput inputMode="numeric" textAlign={'center'} 
        editable={state==Constant.reset || state==Constant.pause}
        maxLength={2}
        ref={ref}
        value={gapTime.toString()}
        onChange={(temp)=>{
          //console.log("change text-",text);
          try {
            const tempValue=temp.nativeEvent.text.trim();
            tempValue !== '' ? setGapTime(parseInt(tempValue)) : setGapTime(0); // Convert empty input to 0  
          } catch (error) {
            console.error(error);
          }
      }}
     
        style={styles.gapRange}></TextInput>
        </View>

        <View
          style={{
            flex: 5,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <WorkTimer
            time={WorkTime}
            setTime={setWorkTime}
            state={state}
            timerState={timerState}
            swap={Swap}
          />
          <Text style={styles.StateText}>
            {timerState == Constant.timerBreak ? "Break" : "Work"}
          </Text>
          <ResetTimer
            time={RestTime}
            setTime={setRestTime}
            state={state}
            timerState={timerState}
            swap={Swap}
          />
        </View>

        <View
          style={{
            flex: 1,
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
              backgroundColor: state == Constant.start ? "yellow" : "#00ab66",
            }}
          >
            <Text>{state == Constant.start ? "Pause" : "Start"}</Text>
          </TouchableOpacity>
        </View>
        
      </SafeAreaView>
      </TouchableWithoutFeedback>
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
  StateText: {
    color:"#C576F6",
    fontSize:27
  },
  header:{flex: 1,
    maxHeight: 50,
    paddingHorizontal:10,
    flexDirection:"row",
  },
  LocText: {
    flex: 7,
    maxHeight: 30,
    alignItems: "center",
    textAlign: 'right',
    marginTop:3,
  },
  CrossText: {
    flex: 1,
    maxHeight: 30,
    alignItems: "center",
    textAlign: 'right',
    marginTop:3,
  },
  gapRange:{
    flex:1,
    maxHeight:30,
    marginLeft:5,
    color:"yellow",
    textAlign: 'center',    
  }
});
