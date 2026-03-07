const InspirationSection = () => {
  const videoSource = "https://res.cloudinary.com/dqkczdjjs/video/upload/v1772916554/inspirationsVideo_lp99ti_video-converter.com_vtd9ul.mp4";

  return (
    <div className="w-full overflow-hidden ">
      <h1 className="lg:text-4xl text-2xl lg:p-0 p-4 mt-5 font-semibold flex items-center justify-center text-start">
        Our origin. Our Inspiration. <br />
        -----A journey through the heart of Barbados.
      </h1>

      <div className="relative h-[450px] md:h-screen md:max-h-none lg:h-screen lg:max-h-none mt-10 w-screen md:w-full lg:w-full -mx-[calc((100vw-100%)/2)] md:mx-0 lg:mx-0 overflow-hidden">
        {/* 1. Background Video Element (Absolute position to fill container) */}
        <video
          className="absolute inset-0 w-full  h-full object-cover sm:object-cover"
          src={videoSource}
          autoPlay
          loop
          muted
          playsInline
        />

        <div>
          
        </div>

        {/* Optional: Dark overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
    </div>
  );
};

export default InspirationSection;
