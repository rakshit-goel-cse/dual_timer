import { Text, TextInput, View } from "react-native"
import { Constant } from "./Constants";

export const WorkTimer=({time,setTime,state,timerState})=>{

    return(
        <View style={{
            backgroundColor:timerState==Constant.timerWork?"green":"gray",
            width:220,
            height:220,
            borderRadius:120,
            alignSelf:"center",
            //marginTop:90,
            justifyContent: "center",
            alignItems: "center",
        }}>
            <TextInput style={{color:"white",fontWeight:"bold",fontSize:30}}
            onChange={(temp)=>setTime(temp.nativeEvent.text)}
            placeholder="0"
            placeholderTextColor="white"
            editable={state==Constant.reset}
            inputMode="numeric">{time>0?time:''}</TextInput>
        </View>
    )
}