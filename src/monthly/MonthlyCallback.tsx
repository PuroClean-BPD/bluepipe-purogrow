import {useEffect,useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {monthlyClient} from './client';
import './monthly.css';
export default function MonthlyCallback(){const navigate=useNavigate();const [message,setMessage]=useState('Verifying secure access…');useEffect(()=>{const code=new URLSearchParams(window.location.search).get('code');if(!code){setMessage('This sign-in link is unavailable.');return;}monthlyClient.auth.exchangeCodeForSession(code).then(({error})=>{if(error)setMessage('This sign-in link is unavailable.');else navigate('/portal/monthly',{replace:true});});},[navigate]);return <main className="monthly-portal flex items-center justify-center"><p role="status">{message}</p></main>;}
