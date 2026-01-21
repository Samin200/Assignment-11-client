const TrustedBy = () => {
  return (
    <section className="py-20 bg-base-100">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-6">
          Trusted by Readers & Libraries
        </h2>
        <p className="text-base-content/70 max-w-2xl mx-auto mb-12">
          BookCourier partners with top libraries and is trusted by thousands of
          readers across the country.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
          {["LibraryOne", "BookHub", "CityLibrary", "ReadMore"].map(
            (name, index) => (
              <div
                key={index}
                className="bg-base-200 rounded-xl py-8 font-semibold text-lg shadow"
              >
                {name}
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;