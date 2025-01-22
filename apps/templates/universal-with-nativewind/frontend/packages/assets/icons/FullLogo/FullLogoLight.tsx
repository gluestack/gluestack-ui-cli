import { cssInterop } from 'nativewind';
import * as React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

cssInterop(Svg, {
  className: {
    target: 'style',
    // @ts-ignore
    nativeStyleToProp: { width: true, height: true, fill: true },
  },
});

const FullLogoLight = (props: any) => (
  <Svg
    width="196"
    height="40"
    viewBox="0 0 196 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Rect width="40" height="40" rx="20" fill="#FBF6FF" />
    <Path
      d="M10 28.8003L15 24.2549L20 28.8003L25 24.2549L30 28.8003"
      stroke="#1B1F2C"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10 22.2554L15 17.71L20 22.2554L25 17.71L30 22.2554"
      stroke="#1B1F2C"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10 15.7095L15 11.1641L20 15.7095L25 11.1641L30 15.7095"
      stroke="#1B1F2C"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M49.2664 25.9432H46.2227L52.312 9.07031H55.3329L61.4223 25.9432H58.31L56.9504 22.0454H50.6489L49.2664 25.9432ZM53.4467 14.1027L51.5038 19.5512H56.0973L54.1544 14.1027C54.0977 13.8668 54.0191 13.6419 53.9404 13.406C53.8618 13.1701 53.817 12.979 53.8051 12.8108C53.7713 12.9681 53.7265 13.1591 53.6597 13.395C53.5912 13.6309 53.5134 13.8668 53.4348 14.1027H53.4467Z"
      fill="#262627"
    />
    <Path
      d="M63.1758 31.2224V14.5398H65.7816L65.9617 16.2697C66.2991 15.6068 66.8257 15.1012 67.5343 14.7309C68.242 14.3606 69.0174 14.1914 69.8595 14.1914C70.9484 14.1914 71.8929 14.4383 72.6902 14.9329C73.4774 15.4276 74.1065 16.1124 74.5435 16.9892C74.9934 17.8651 75.2192 18.8992 75.2192 20.1007C75.2192 21.3021 75.0052 22.3362 74.6002 23.2578C74.1851 24.1785 73.578 24.9091 72.7917 25.4375C71.9944 25.9651 71.0389 26.2348 69.8933 26.2348C69.0512 26.2348 68.2758 26.0776 67.5801 25.7521C66.8833 25.4266 66.3558 24.9877 65.9955 24.4153V31.2233H63.1767L63.1758 31.2224ZM66.0166 20.2479C66.0166 20.9217 66.1519 21.5288 66.4097 22.0454C66.6685 22.573 67.0497 22.978 67.5334 23.2807C68.0153 23.5842 68.5776 23.7296 69.2295 23.7296C69.8814 23.7296 70.4656 23.5833 70.9356 23.2807C71.4074 22.9771 71.7795 22.573 72.0264 22.0454C72.2733 21.5169 72.3967 20.9217 72.3967 20.2479C72.3967 19.574 72.2733 18.9669 72.0264 18.4503C71.7795 17.9227 71.4193 17.5177 70.9356 17.2151C70.4647 16.9115 69.8915 16.7661 69.2295 16.7661C68.5675 16.7661 68.0153 16.9124 67.5334 17.2041C67.0497 17.4958 66.6795 17.9008 66.4097 18.4284C66.151 18.9568 66.0166 19.563 66.0166 20.2488V20.2479Z"
      fill="#262627"
    />
    <Path
      d="M77.1953 31.2224V14.5398H79.8011L79.9812 16.2697C80.3186 15.6068 80.8471 15.1012 81.5539 14.7309C82.2616 14.3606 83.0369 14.1914 83.879 14.1914C84.9698 14.1914 85.9124 14.4383 86.7097 14.9329C87.497 15.4276 88.126 16.1124 88.564 16.9892C89.0129 17.8651 89.2378 18.8992 89.2378 20.1007C89.2378 21.3021 89.0239 22.3362 88.6188 23.2578C88.2037 24.1785 87.5975 24.9091 86.8103 25.4375C86.013 25.9651 85.0575 26.2348 83.9119 26.2348C83.0698 26.2348 82.2954 26.0776 81.5987 25.7521C80.902 25.4266 80.3744 24.9877 80.0142 24.4153V31.2233H77.1953V31.2224ZM80.026 20.2479C80.026 20.9217 80.1614 21.5288 80.4192 22.0454C80.678 22.573 81.0601 22.978 81.542 23.2807C82.0257 23.5842 82.588 23.7296 83.238 23.7296C83.8881 23.7296 84.4742 23.5833 84.946 23.2807C85.4178 22.9771 85.7881 22.573 86.035 22.0454C86.2837 21.5169 86.4071 20.9217 86.4071 20.2479C86.4071 19.574 86.2837 18.9669 86.035 18.4503C85.7881 17.9227 85.4297 17.5177 84.946 17.2151C84.4742 16.9115 83.9018 16.7661 83.238 16.7661C82.5743 16.7661 82.0257 16.9124 81.542 17.2041C81.0601 17.4958 80.688 17.9008 80.4192 18.4284C80.1605 18.9568 80.026 19.563 80.026 20.2488V20.2479Z"
      fill="#262627"
    />
    <Path
      d="M94.7324 9.07031V25.9432H91.7773V9.07031H94.7324ZM92.282 25.9432V23.2249H101.764V25.9432H92.282Z"
      fill="#262627"
    />
    <Path
      d="M107.361 26.246C106.158 26.246 105.214 25.9205 104.507 25.2686C103.811 24.6167 103.463 23.7518 103.463 22.6957C103.463 21.6397 103.833 20.8195 104.564 20.1905C105.294 19.5724 106.338 19.2021 107.686 19.0896L111.102 18.8089V18.5502C111.102 18.0217 111.001 17.6066 110.81 17.2921C110.618 16.9776 110.349 16.7417 109.99 16.5954C109.63 16.4491 109.226 16.3705 108.743 16.3705C107.912 16.3705 107.272 16.5387 106.833 16.8651C106.384 17.1906 106.159 17.6624 106.159 18.2585H103.755C103.755 17.4274 103.969 16.7078 104.395 16.1016C104.822 15.4955 105.418 15.0228 106.192 14.6863C106.967 14.3489 107.866 14.1807 108.877 14.1807C109.889 14.1807 110.788 14.3608 111.529 14.7201C112.27 15.0794 112.832 15.6189 113.235 16.3375C113.64 17.0562 113.83 17.944 113.83 19V25.9196H111.36L111.146 24.2345C110.897 24.8188 110.427 25.2906 109.73 25.6609C109.033 26.0321 108.236 26.2113 107.336 26.2113L107.359 26.2451L107.361 26.246ZM108.259 24.123C109.135 24.123 109.832 23.8761 110.348 23.3815C110.864 22.8868 111.123 22.202 111.123 21.3261V20.7308L108.741 20.911C107.865 20.9896 107.248 21.1697 106.876 21.4504C106.506 21.7311 106.326 22.1133 106.326 22.5741C106.326 23.0797 106.494 23.4619 106.831 23.7316C107.169 23.9904 107.651 24.1248 108.258 24.1248L108.259 24.123Z"
      fill="#262627"
    />
    <Path
      d="M123.918 14.5405H126.739V25.943H124.132L123.918 24.4151C123.581 24.9546 123.076 25.3926 122.39 25.7299C121.704 26.0673 120.986 26.2356 120.221 26.2356C118.919 26.2356 117.896 25.8195 117.156 24.9884C116.413 24.1573 116.043 23.0446 116.043 21.663V14.5295H118.862V20.6637C118.862 21.7426 119.075 22.517 119.481 22.9888C119.896 23.4606 120.492 23.7075 121.277 23.7075C122.166 23.7075 122.828 23.4377 123.267 22.9102C123.692 22.3817 123.918 21.5734 123.918 20.4945V14.5186V14.5414V14.5405Z"
      fill="#262627"
    />
    <Path
      d="M132.037 25.9433H129.217V14.5408H131.824L132.059 16.0129C132.407 15.4396 132.912 15.0016 133.574 14.6761C134.226 14.3506 134.945 14.1934 135.709 14.1934C137.136 14.1934 138.226 14.6203 138.955 15.4624C139.686 16.3045 140.058 17.4621 140.058 18.9222V25.9323H137.237V19.5851C137.237 18.6306 137.023 17.9229 136.585 17.4511C136.158 16.9793 135.574 16.7434 134.833 16.7434C133.957 16.7434 133.271 17.0241 132.777 17.5745C132.283 18.1249 132.037 18.8664 132.037 19.7872V25.9433H132.037Z"
      fill="#262627"
    />
    <Path
      d="M142.025 20.2259C142.025 19.0574 142.274 18.0242 142.756 17.1144C143.24 16.2047 143.913 15.497 144.767 14.9804C145.621 14.4638 146.609 14.2051 147.733 14.2051C149.283 14.2051 150.564 14.6092 151.553 15.4184C152.543 16.2276 153.115 17.3165 153.272 18.6871H150.453C150.284 18.0352 149.969 17.5524 149.52 17.2269C149.07 16.9014 148.498 16.7323 147.824 16.7323C147.24 16.7323 146.723 16.8785 146.262 17.1592C145.801 17.4399 145.453 17.8441 145.216 18.3725C144.969 18.9001 144.846 19.5182 144.846 20.2378C144.846 20.9573 144.958 21.5855 145.194 22.103C145.429 22.6314 145.757 23.0356 146.194 23.3163C146.633 23.597 147.149 23.7433 147.755 23.7433C148.464 23.7433 149.048 23.575 149.52 23.2376C149.992 22.9003 150.295 22.4175 150.453 21.7884H153.295C153.172 22.6762 152.856 23.4626 152.363 24.1364C151.867 24.8103 151.217 25.3269 150.43 25.709C149.644 26.0912 148.757 26.2704 147.756 26.2704C146.601 26.2704 145.599 26.0236 144.735 25.518C143.87 25.0233 143.208 24.3156 142.736 23.4168C142.264 22.5181 142.027 21.462 142.027 20.2487V20.2259H142.025Z"
      fill="#262627"
    />
    <Path
      d="M158.09 25.9428H155.27V8.77832H158.112V16.0243C158.461 15.4739 158.966 15.024 159.595 14.6985C160.236 14.373 160.966 14.2039 161.797 14.2039C163.201 14.2039 164.257 14.6309 164.988 15.473C165.718 16.3151 166.089 17.4726 166.089 18.9328V25.9428H163.27V19.5956C163.27 18.9437 163.168 18.4162 162.966 18.0001C162.763 17.5841 162.494 17.2696 162.134 17.0675C161.776 16.8545 161.37 16.753 160.888 16.753C160.303 16.753 159.797 16.8764 159.37 17.1352C158.943 17.394 158.63 17.7414 158.405 18.1803C158.18 18.6292 158.067 19.1348 158.067 19.7081V25.9428H158.09Z"
      fill="#262627"
    />
    <Path
      d="M171.808 9.07031V25.9432H168.854V9.07031H171.808ZM182.12 9.07031L171.11 23.2359V18.8325L178.638 9.07031H182.12ZM174.481 18.5628L176.367 16.0237L182.187 25.9432H178.773L174.481 18.5628Z"
      fill="#262627"
    />
    <Path
      d="M185.265 12.2612C184.793 12.2612 184.389 12.093 184.052 11.7666C183.714 11.4411 183.557 11.036 183.557 10.5533C183.557 10.0705 183.725 9.67734 184.052 9.35092C184.378 9.02543 184.781 8.86816 185.265 8.86816C185.748 8.86816 186.141 9.02543 186.477 9.35092C186.814 9.67642 186.973 10.0696 186.973 10.5533C186.973 11.0369 186.804 11.4292 186.477 11.7666C186.151 12.1039 185.746 12.2612 185.265 12.2612ZM183.872 25.944V14.5415H186.691V25.944H183.872Z"
      fill="#262627"
    />
    <Path
      d="M188.355 14.5396H195.556V16.8985H188.355V14.5396ZM193.366 25.942H190.545V10.9893H193.366V25.942Z"
      fill="#262627"
    />
  </Svg>
);
export default FullLogoLight;
