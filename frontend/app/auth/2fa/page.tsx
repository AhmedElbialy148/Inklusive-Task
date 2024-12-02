'use client';
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { postRequest } from '../api_requests';

const TwoFactorAuthForm = () => {
  const router = useRouter()
  const [otp, setOtp] = useState('');
  const [errorStatus, setErrorStatus] = useState('');


  const handleOnSubmit = async () => {
    if (otp === '' ) {
      alert('Please fill all the fields!')
      return
    } 
    const data = {
      otp,
    }
    // send the form data to our forms API and get a response
    let jwtToken = localStorage.getItem('access_token') || '';
    const res = await postRequest('/auth/verify-otp', data, jwtToken);
    if (res.error) {
      setErrorStatus(res.error)
    } else {
      setErrorStatus('')
      setOtp('')
      router.push('/')
      return null;
    }
    
  }

 
    return (   
        <section className="h-screen gradient-form bg-gray-200 md:h-screen">
          <div className="container py-12 px-6 h-full">
            <div className="flex justify-center items-center flex-wrap h-full g-6 text-gray-800">
              <div className="xl:w-4/12">
                <div className="block bg-white shadow-lg rounded-lg">
                  <div className="">
                    <div className="lg:w-12/12 px-4 md:px-0">
                      <div className="md:p-12 md:mx-6">
                        <div className="text-center">
                          <h4 className="text-2xl font-semibold mt-1 mb-12 pb-1">2FA</h4>
                        </div>
                        <form onSubmit={(e) => {
                          e.preventDefault()
                          handleOnSubmit()
                        }}>
                          <p className="mb-4">Please provide the OTP sent to your email</p>
                          <div className="mb-4">
                            <input
                              type="text"
                              className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                              id="exampleFormControlInput1"
                              placeholder="OTP"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                            />
                          </div>
                          <p className="mb-4 text-rose-700">{errorStatus}</p>

                          <div className="text-center pt-1 mb-12 pb-1">
                            <button
                              className="inline-block px-6 py-2.5 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:shadow-lg focus:outline-none focus:ring-0 active:shadow-lg transition duration-150 ease-in-out w-full mb-3"
                              type="submit"
                              onSubmit={handleOnSubmit}
                              data-mdb-ripple="true"
                              data-mdb-ripple-color="light"
                              style={{
                                background: "linear-gradient(to right,#ee7724,#d8363a,#dd3675,#b44593)"}}
                            >
                              Send
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </section>

 )
}

export default TwoFactorAuthForm