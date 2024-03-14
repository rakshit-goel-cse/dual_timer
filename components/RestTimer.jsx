import { TextInput, View } from "react-native"
import { Constant } from "./Constants";

export const ResetTimer=({time,setTime,state,timerState})=>{

    return(
        <View style={{
            backgroundColor:timerState==Constant.timerBreak?"green":"grey",
            width:160,
            height:160,
            borderRadius:120,
            alignSelf:"center",
            marginTop:90,
            elevation:9,
            shadowRadius:160,
            justifyContent: "center",
            alignItems: "center",
        }}>
            <TextInput style={{color:"white",fontWeight:"bold",fontSize:20}}
            onChange={(temp)=>setTime(temp.nativeEvent.text)}
            inputMode="numeric">{time}</TextInput>
        </View>
    )
}