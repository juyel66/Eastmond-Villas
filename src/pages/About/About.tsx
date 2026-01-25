import Affiliates from "../Home/Component/Affiliates";
import EstateExperience from "../Home/Component/EstateExperience";

import AboutCard from "./AboutCard";


const About = () => {
  return (
    <div>
      <div>
       <h1 className="text-4xl font-bold text-center mt-15 "> About</h1>
      </div>

        <AboutCard />

       <div className="mt-5">
         <EstateExperience />
       </div>

       <div className="mt-0"><Affiliates /></div>

 

    </div>
  );
};

export default About;
