import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Constant } from "./components/Constants";
import { WorkTimer } from "./components/WorkTimer";
import { ResetTimer } from "./components/RestTimer";

export default function App() {
  const [state, setState] = useState(Constant.reset);
  const [WorkTime, setWorkTime] = useState(0);
  const [RestTime, setRestTime] = useState(0);
  const [timerState, setTimerState] = useState(Constant.timerWork);
  const [timeArray, setTimeArray] = useState([0,0]);

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
                //return prevWorkTime;
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
                //return prevRestTime;
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
    setWorkTime(0);
    setRestTime(0);
    setState(Constant.reset);
    setTimerState(Constant.timerWork);
  };

  const Swap = () =>{
      if(timerState==Constant.timerWork){
        setTimerState(Constant.timerBreak);
        setWorkTime(timeArray[0]);
      }
      else if(timerState==Constant.timerBreak){
        setTimerState(Constant.timerWork);
        setRestTime(timeArray[1]);
      }   
  }


  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <WorkTimer time={WorkTime} setTime={setWorkTime} state={state} timerState={timerState} swap={Swap}/>
        <ResetTimer time={RestTime} setTime={setRestTime} state={state} timerState={timerState} swap={Swap}/>

        <View
          style={{
            position: "absolute",
            bottom: 0, // Positioned at the bottom of the screen
            left: 0, // Aligning it to the left edge
            right: 0, // Aligning it to the right edge
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
});
