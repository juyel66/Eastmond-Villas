import React from 'react';

const StorySection: React.FC = () => {
  return (
    <div>

      {/* 1️⃣ Section One */}
      <section className="bg-white p-5 mt-10 border-2 rounded-2xl pb-5 border-gray-200 lg:border-0 broder-2">
        <div className="">
          <div className="lg:grid lg:grid-cols-3 lg:gap-16 xl:gap-24 items-center">
            <div className="lg:pr-8 mb-12 lg:mb-0 lg:col-span-2">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-6">
                Our Story – Born from a Vision
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Eastmond Villas began as the dream of a visionary accountant with a Master's in
                International Business. What started as a personal passion for real estate has
                evolved into a family-run agency redefining holiday rentals in Barbados —
                blending professionalism, trust, and heartfelt hospitality.
              </p>
            </div>

            <div className="flex justify-center lg:justify-end lg:col-span-1">
              <div className="relative w-full max-w-sm lg:max-w-none lg:w-full aspect-[4/3] rounded-tl-4xl rounded-br-4xl rounded-tr-xl rounded-bl-xl shadow-xl overflow-hidden">
                <img
                  src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1761523975/medium-shot-plus-sized-woman-influencer_23-2151414147_1_n5fjkm.png"
                  alt="Framed Eastmond Villas logo in a luxury interior"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black opacity-0"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2️⃣ Section Two */}
      <section className="bg-white lg:mt-0 md:mt-3 mt-5 border-2 rounded-2xl pb-5 border-gray-200 lg:border-0 broder-2 lg:pt-0 pt-5 ">
        <div className="">
          <div className="lg:grid lg:grid-cols-3 lg:gap-16 xl:gap-24 items-center">
            <div className="flex justify-center lg:justify-start mb-12 lg:mb-0 lg:col-span-1">
              <div className="relative w-full max-w-sm lg:max-w-none lg:w-full aspect-[4/3] rounded-tl-4xl  rounded-br-4xl rounded-tr-xl rounded-bl-xl shadow-xl overflow-hidden">
                <img
                  src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760220353/medium-shot-plus-sized-woman-influencer_23-2151414147_2_5_fz3dmp.png"
                  alt="Luxury Villa Interior with sea view"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-2 lg:pl-8">
              <h2 className="ext-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-6">
                The Essence of Eastmond Villas
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                We are more than a real estate company — we are creators of exceptional
                journeys. Each villa reflects our devotion to luxury, privacy, and artistry. Our name
                has become synonymous with opulence, sophistication, and the promise of
                moments you'll treasure forever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3️⃣ Section Three */}
      <section className="bg-white lg:mt-0 md:mt-3 border-2 rounded-2xl pb-5 border-gray-200 lg:border-0 broder-2 ">
        <div className="">
          <div className="lg:grid lg:grid-cols-3 lg:gap-16 xl:gap-24 items-center">
            <div className="lg:pr-8 mb-12 lg:mb-0 lg:col-span-2">
              <h2 className="ext-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-6">
                Architectural Elegance & Ambience
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Every Eastmond villa is a masterpiece — curated interiors, bespoke art, and tranquil outdoor spaces merge to form an oasis of beauty. With turquoise horizons and lush gardens, our properties are sanctuaries where time slows, and peace unfolds effortlessly.
              </p>
            </div>

            <div className="flex justify-center lg:justify-end lg:col-span-1">
              <div className="relative w-full max-w-sm lg:max-w-none lg:w-full aspect-[4/3] rounded-tl-4xl rounded-br-4xl shadow-xl rounded-tr-xl rounded-bl-xl overflow-hidden">
                <img
                  src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760219929/medium-shot-plus-sized-woman-influencer_23-2151414147_2_1_ckmbpy.png"
                  alt="Framed Eastmond Villas logo in a luxury interior"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black opacity-0"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4️⃣ Section Four */}
      <section className="bg-white lg:mt-0 md:mt-3 mt-5 border-2 rounded-2xl pb-5 lg:pt-5 pt-4 border-gray-200 lg:border-0 broder-2">
        <div className="">
          <div className="lg:grid lg:grid-cols-3 lg:gap-16 xl:gap-24 items-center">
            <div className="flex justify-center lg:justify-start mb-12 lg:mb-0 lg:col-span-1">
              <div className="relative w-full max-w-sm lg:max-w-none lg:w-full aspect-[4/3] rounded-tl-4xl rounded-br-4xl rounded-tr-xl rounded-bl-xl shadow-xl overflow-hidden">
                <img
                  src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760220019/medium-shot-plus-sized-woman-influencer_23-2151414147_2_2_daibdq.png"
                  alt="Luxury Villa Interior with sea view"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-2 lg:pl-8">
              <h2 className="ext-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-6">
                Crafted Experiences & Personalized Service
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                From the moment you arrive, our dedicated team curates every detail — private chefs, bespoke itineraries, luxury transfers, and local adventures. Every stay is customized, ensuring your holiday is effortless, unforgettable, and uniquely yours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5️⃣ Section Five */}
      <section className="bg-white lg:mt-0 md:mt-3 mt-5 border-2 rounded-2xl pb-5 border-gray-200 lg:border-0 broder-2">
        <div className="">
          <div className="lg:grid lg:grid-cols-3 lg:gap-16 xl:gap-24 items-center">
            <div className="lg:pr-8 mb-12 lg:mb-0 lg:col-span-2">
              <h2 className="ext-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-6">
                Discover Barbados – Island of Inspiration
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Beyond our villas lies the charm of Barbados — sun-kissed beaches, vibrant culture, and world-class cuisine. Explore coral reefs, dance to calypso rhythms, and indulge in the island’s authentic warmth. Eastmond Villas invites you to experience Barbados like never before.
              </p>
            </div>

            <div className="flex justify-center lg:justify-end lg:col-span-1">
              <div className="relative w-full max-w-sm lg:max-w-none lg:w-full aspect-[4/3] rounded-tl-4xl rounded-br-4xl rounded-tr-xl rounded-bl-xl shadow-xl overflow-hidden">
                <img
                  src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760220066/medium-shot-plus-sized-woman-influencer_23-2151414147_2_3_v9nrjr.png"
                  alt="Framed Eastmond Villas logo in a luxury interior"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black opacity-0"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6️⃣ Section Six */}
      <section className="bg-white mt-5 pt-4 border-2 rounded-2xl pb-5 border-gray-200 lg:border-0 broder-2">
        <div className="">
          <div className="lg:grid lg:grid-cols-3 lg:gap-16 xl:gap-24 items-center">
            <div className="flex justify-center lg:justify-start mb-12 lg:mb-0 lg:col-span-1">
              <div className="relative w-full max-w-sm lg:max-w-none lg:w-full aspect-[4/3] rounded-tl-4xl rounded-tr-xl rounded-bl-xl rounded-br-4xl shadow-xl overflow-hidden">
                <img
                  src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760220096/medium-shot-plus-sized-woman-influencer_23-2151414147_2_4_xtxpzs.png"
                  alt="Luxury Villa Interior with sea view"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-2 lg:pl-8">
              <h2 className="ext-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-6">
                Where Luxury Meets Enchantment
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Eastmond Villas is not just a stay — it’s a feeling. A harmony of elegance and emotion. A place where hospitality becomes art, and memories are handcrafted. Welcome to the realm where every moment whispers luxury, and every experience lingers in your heart.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

const AboutCard: React.FC = () => (
  <div className="min-h-screen p-2">
    <div className="container mx-auto"><StorySection /></div>
  </div>
);

export default AboutCard;
