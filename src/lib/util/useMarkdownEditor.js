// import { throttle } from "lodash";

// export const useMarkdownEditor = () => {

//     const handleAutoSaving = throttle(
//         (content) => {
//             //selectednote area

//             let jsonString = JSON.stringify(content, null, 2);

//             console.log("content", jsonString)
//         },
//         2000,
//         {
//             leading: false,
//             trailing: true,
//         }
//     );

//     return { handleAutoSaving }
// }