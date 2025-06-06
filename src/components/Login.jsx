import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import React, { useEffect, useState } from 'react'
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { BeatLoader } from "react-spinners"
import Error from "./Error"
import * as Yup from 'yup'
import UseFetch from "@/hooks/UseFetch"
import { login } from "@/db/apiAuth"
import { useNavigate, useSearchParams } from "react-router-dom"
import { UrlState } from "@/Context"



const Login = () => {

  const [errors, setErrors] = useState([])

  const [formData, setformData] = useState({
    email:"",
    password:""
  });

  const navigate = useNavigate();
  let [searchParams] = useSearchParams();
  const longLink = searchParams.get("createNew");

  const handleInputChange = (e) =>{
    const { name, value } = e.target
    setformData((prevState) =>({
      ...prevState,
      [name]:value,
    }));
  };

  const {data, error, loading, fn:fnLogin} = UseFetch(login, formData);
  const {fetchUser} = UrlState()
  useEffect(() =>{
    console.log(data);
    if(error === null && data){
         navigate(`/dashboard?${longLink ? `createNew=${longLink}` : ""}`);
         fetchUser();
    }
  }, [data,error]);

  const handleLogin = async() =>{
    setErrors([])
    try {
      const schema = Yup.object().shape({
        email: Yup.string().email("Ivalid Email").required("Email is Required"),
        password: Yup.string().min(6, "Password must be at least 6 character").required("Password is Required"),
      });
      await schema.validate(formData, {abortEarly:false});
      await fnLogin()
    } catch (e) {
      const newErrors = {};

      e?.inner?.forEach((err)=>{
        newErrors[err.path] = err.message;
      });
      setErrors(newErrors);
    }
  };


  return (
 <Card>
  <CardHeader>
    <CardTitle>Login</CardTitle>
    <CardDescription>to your account if you already have one</CardDescription>
  </CardHeader>
      {error && <Error message={error.message} />}
  <CardContent className=" space-y-2">
    <div className=" space-y-1">
      <Input name="email" type="email" placeholder="Enter Email...." onChange={handleInputChange} />
     {errors.email && <Error message={errors.email} />}
    </div>
    <div className=" space-y-1">
      <Input name="password" type="password" placeholder="Enter Password...." onChange={handleInputChange} />
         {errors.password && <Error message={errors.password} />}
    </div>
  </CardContent>
  <CardFooter>
    <Button onClick={handleLogin}>{loading?<BeatLoader size={10} color="#36d7b7"/>:"Login"}</Button>
  </CardFooter>
</Card>
  )
}

export default Login
