import App from "./globals"
import Icon from 'react-native-vector-icons/FontAwesome'
import _ from 'underscore'
import { Actions } from 'react-native-router-flux'
var store = require('react-native-simple-store');
import GiftedSpinner from 'react-native-gifted-spinner'

import React, {
  Alert,
  Text,
  Image,
  View,
  TouchableOpacity
} from 'react-native'

class TaskHeader extends React.Component {
  propTypes = {
    currentScreen: React.PropTypes.string.isRequired, 
    name: React.PropTypes.string.isRequired
  }

  backPress() {
    Actions.pop()
  }

  capitalize(string) {
    return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
  }

  render() {
    // {(this.props.currentScreen) ? "Back" : "Continue"}

    return (
      <View style={{height:60,backgroundColor:"#425869",alignItems:"center",paddingTop:20}}>
        <View style={{position:"absolute",left:10,top:0}}>
          <TouchableOpacity onPress={this.backPress} style={{padding:17}}>
            <Icon name="chevron-left" size={15} color="#fff" 
                style={{marginRight:5,marginTop:2,position:"absolute",left:0,top:21}}/>
              <Text style={{color:"white",fontWeight:"bold",fontSize:18}}>
            {(this.props.currentScreen) ? "Back" : "Cancel"}
            </Text>
          </TouchableOpacity>

        </View>
        <View >
          <Text style={{fontSize:20,color:"white",fontWeight:"bold"}}>
            {this.props.name}
          </Text>
        </View>
        <View style={{position:"absolute",right:10,top:20}}>
        </View>
      </View>
    )
  }
}


export default class FinishNote extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
    }
    this.onPress = this.onPress.bind(this)
  }
  propTypes = {
    checkOutGeolocation: React.PropTypes.string.isRequired,
    checkOutTime: React.PropTypes.string.isRequired,
    overallNote: React.PropTypes.string.isRequired,
    _id: React.PropTypes.string.isRequired,
    tasks: React.PropTypes.array.isRequired
  }

  async onPress() {
    body  = {
        "checkOutTime": this.props.checkOutTime,
        "metadata": {
            "checkOutGeolocation": this.props.checkOutGeolocation,          
            "notes": this.props.overallNote,
            // TODO add supply notes + medical notes
            "observations": _.values(this.props.medicalValues), 
            "supplies": _.map(this.props.supplyValues, function(supply) { 
              return {
                "name": supply
              }
            })
        },
        "Tasks": this.props.tasks
    }
    this.setState({loading: true})
    let body = JSON.stringify(body)
    var token = await store.get("_token")
    var url = `https://app.sage.care/api/v1/cp/s/events/${this.props._id}/checkout`
    var res = await fetch(url, { method: 'PUT', headers: App.headers(token), body: body})
    if(res.status == 200) {
      Actions.launch({type: "replace"})
      this.setState({loading: false})
    } else {
      Alert.alert( 'Warning!', 'There was an error - please try again.',
      [ {text: 'Cancel', onPress: () => {  }, style: 'cancel'},
        {text: 'Yes', onPress: () => { }}
      ])
      this.setState({loading: false})
    }
  }

  render() {
    var btnColor = "#40BF93"
    var btnText = (this.state.loading) ? "LOADING ..." : "BACK TO VISITS"
    return (
      <View>
        <TaskHeader />
      <View style={{alignItems:"center"}}>
        <View style={{marginTop:200,marginBottom:80,alignItems:"center"}}>
          <Image source={require("./img/icon-check@2x.png")} style={{width:70,height:70,marginBottom:20}}/>
          <Text style={{fontSize:16}}>{"You're all done!"}</Text>
          <Text style={{fontSize:16}}>{"Great job with the visit!"}</Text>
        </View>
      <TouchableOpacity onPress={this.onPress}> 
        <View style={{backgroundColor:btnColor,marginLeft:0,padding:5,borderRadius:3,marginTop:10,height:45,width:335,alignItems:"center",paddingTop:10}}> 
          {(this.state.loading) ? <GiftedSpinner color={"white"} style={{height:18, position:"absolute",left:-100,top:1}}/> : <View /> }
          <Text style={{fontWeight:"bold",color:"white"}}> {btnText} </Text> 
      </View> 
      </TouchableOpacity> 
      </View>
    </View>
    )
  }
}
