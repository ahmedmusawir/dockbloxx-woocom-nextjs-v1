import { getImageUrl } from "@/lib/utils";

interface TeamMember {
  name: string;
  role: string;
  image: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Brady Bragg",
    role: "Chief Innovation Officer",
    image: getImageUrl(
      "/wp-content/uploads/Screen-Shot-2025-01-08-at-3.25.42-AM@2x.png"
    ),
  },
  {
    name: "Dan Nestor",
    role: "Strategic Accounts",
    image: getImageUrl(
      "/wp-content/uploads/Screen-Shot-2025-01-08-at-3.25.49-AM@2x.png"
    ),
  },
  {
    name: "Bryce Neal",
    role: "Director of Operations",
    image: getImageUrl(
      "/wp-content/uploads/Screen-Shot-2025-01-08-at-3.25.56-AM@2x.png"
    ),
  },
  {
    name: "Mattie Smith",
    role: "Director of Marketing",
    image: getImageUrl(
      "/wp-content/uploads/Screen-Shot-2025-01-08-at-3.26.04-AM@2x.png"
    ),
  },
  {
    name: "Clint Presley",
    role: "CFO",
    image: getImageUrl(
      "/wp-content/uploads/Screen-Shot-2025-01-08-at-3.26.12-AM@2x.png"
    ),
  },
  {
    name: "Anthony",
    role: "Director of Sales",
    image: getImageUrl("/wp-content/uploads/Anthory_1.png"),
  },
  {
    name: "Andrew Bourke",
    role: "I.T.",
    image: getImageUrl(
      "/wp-content/uploads/Screen-Shot-2025-01-08-at-3.26.34-AM@2x.png"
    ),
  },
  {
    name: "Dixie",
    role: "Pawject Manager",
    image: getImageUrl("/wp-content/uploads/Dog_1.png"),
  },
];

const MeetTheTeam = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-10">
          Meet the Team
        </h2>
        {/* <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p> */}

        <div className="bg-white shadow-lg rounded-lg p-8">
          {/* Top Row - 4 members */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {teamMembers.slice(0, 4).map((member, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-full max-w-[280px] aspect-square mb-4 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl  font-bold text-blue-600 mb-1">
                  {member.name}
                </h3>
                <p className="text-lg text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>

          {/* Bottom Row - 4 members */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {teamMembers.slice(4).map((member, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-full max-w-[280px] aspect-square mb-4 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl  font-bold text-blue-600 mb-1">
                  {member.name}
                </h3>
                <p className="text-lg text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MeetTheTeam;
