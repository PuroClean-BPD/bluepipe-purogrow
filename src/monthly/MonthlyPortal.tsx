import {useEffect,useState} from 'react';
import {monthlyClient} from './client';
import MonthlyOwnerPortal from './MonthlyOwnerPortal';
import MonthlyStaffPortal from './MonthlyStaffPortal';
export default function MonthlyPortal(){
 const [staff,setStaff]=useState(false);
 useEffect(()=>{const check=async()=>{const {data:{user}}=await monthlyClient.auth.getUser();if(!user){setStaff(false);return;}const {data,error}=await monthlyClient.rpc('monthly_staff_role');setStaff(!error&&['admin','approver','editor'].includes(data??''));};void check();const {data:{subscription}}=monthlyClient.auth.onAuthStateChange(()=>setTimeout(()=>void check(),0));return()=>subscription.unsubscribe();},[]);
 return staff?<MonthlyStaffPortal/>:<MonthlyOwnerPortal/>;
}
