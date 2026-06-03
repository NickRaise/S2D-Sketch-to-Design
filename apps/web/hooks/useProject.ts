import api from "@/lib/axios";
import { useAuthStore } from "@/stores/authStore";
import { useProjectStore } from "@/stores/projectStore";

export const useProject = () => {
  const user = useAuthStore((state) => state.user);
  const {
    projects,
    total,
    createProjectStart,
    isCreating,
    addProject,
    createProjectSuccess,
    createProjectFailure,
  } = useProjectStore();

  const createProject = async () => {
    if (!user?.id) {
      // TODO: throw an toast error here
      return false;
    }

    createProjectStart();

    try {
      const thumbnail = generateGradientThumbnail();
      // call project creation api
      const project = await api.post("/projects", {
        // TODO: Dynamically set the project data using project store
        name: "Untitled Project",
        description: "",
        isPublic: false,
        // no need to send thumbnail to backend, it's generated on the fly in the frontend
      });

      // Needs changes and correct mapping
      addProject({ ...project.data, thumbnail });
      createProjectSuccess();
      // success toast can be added here
    } catch (err) {
      createProjectFailure("Failed to create project. Please try again.");
      // error toast can be added here
    }

    return true;
  };

  return {
    isCreating,
    projects,
    projectTotal: total,
    canCreate: !!user?.id,
    createProject,
  };
};

function generateGradientThumbnail() {
  const gradients = [
    ["#667eea", "#764ba2"],
    ["#ff758c", "#ff7eb3"],
    ["#4facfe", "#00f2fe"],
    ["#43e97b", "#38f9d7"],
    ["#fa709a", "#fee140"],
    ["#30cfd0", "#330867"],
    ["#8EC5FC", "#E0C3FC"],
    ["#f6d365", "#fda085"],
  ];

  const [color1, color2] = gradients[
    Math.floor(Math.random() * gradients.length)
  ] || ["#667eea", "#764ba2"];

  const width = 300;
  const height = 200;

  // Generate floating blurred blobs
  const blobs = Array.from({ length: 5 })
    .map(() => {
      const cx = Math.random() * width;
      const cy = Math.random() * height;
      const r = 40 + Math.random() * 60;

      return `
        <circle
          cx="${cx}"
          cy="${cy}"
          r="${r}"
          fill="white"
          opacity="${(Math.random() * 0.08 + 0.05).toFixed(2)}"
        />
      `;
    })
    .join("");

  const svg = `
    <svg
      width="${width}"
      height="${height}"
      viewBox="0 0 ${width} ${height}"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${color1}" />
          <stop offset="100%" stop-color="${color2}" />
        </linearGradient>

        <filter id="blur">
          <feGaussianBlur stdDeviation="35" />
        </filter>

        <filter id="shadow">
          <feDropShadow
            dx="0"
            dy="6"
            stdDeviation="10"
            flood-opacity="0.25"
          />
        </filter>
      </defs>

      <!-- Background -->
      <rect
        width="100%"
        height="100%"
        rx="24"
        fill="url(#bg)"
      />

      <!-- Blurred blobs -->
      <g filter="url(#blur)">
        ${blobs}
      </g>

      <!-- Glass card -->
      <rect
        x="14"
        y="14"
        width="${width - 28}"
        height="${height - 28}"
        rx="18"
        fill="rgba(255,255,255,0.08)"
        stroke="rgba(255,255,255,0.15)"
      />

      <!-- Center play button -->
      <g filter="url(#shadow)">
        <circle
          cx="${width / 2}"
          cy="${height / 2}"
          r="34"
          fill="rgba(255,255,255,0.18)"
        />

        <polygon
          points="
            ${width / 2 - 8},${height / 2 - 12}
            ${width / 2 - 8},${height / 2 + 12}
            ${width / 2 + 14},${height / 2}
          "
          fill="white"
        />
      </g>
    </svg>
  `;

  const encoded =
    typeof window !== "undefined"
      ? window.btoa(unescape(encodeURIComponent(svg)))
      : Buffer.from(svg).toString("base64");

  return `data:image/svg+xml;base64,${encoded}`;
}
