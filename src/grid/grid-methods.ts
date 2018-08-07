export let _finalDataSet: any[] = [];

// Swap method
export function swap(dataSet: any[], left: number, right: number) {
    // create a temporary reference to swap the object
    const temp = dataSet[left];
    dataSet[left] = dataSet[right];
    dataSet[right] = temp;
}

// quick sort
export function quickSort(dataSet: any[], column: string, low: number, high: number) {
    let j: number;
    if (high > low) {
        j = partition(dataSet, column, low, high);
        if (low < j - 1) {
            quickSort(dataSet, column, low, j - 1);
        }
        if (j < high) {
            quickSort(dataSet, column, j, high);
        }
        _finalDataSet = dataSet;
    }
}

// partition function
export function partition(dataSet: any[], column: string, low: number, high: number): number {
    const pivot = dataSet[Math.floor((low + high) / 2)][column].split('')[0].toLowerCase();

    let i: number = low, j: number = high;

    while (i <= j) {
        while (dataSet[i][column].split('')[0].toLowerCase() < pivot) {
            i++;
        }
        while (dataSet[j][column].split('')[0].toLowerCase() > pivot) {
            j--;
        }
        if (i <= j) {
            swap(dataSet, i, j);
            i++;
            j--;
        }
    }
    return i;
}


// fast sort for ascending if already data set in descending order
export function shellSortAsc(dataSet: any[], column: string) {
    const length: number = dataSet.length;
    // calculating the gap
    let gap: number = Math.floor(length / 2);

    // loop through the array till the gap is less than 0
    while (gap > 0) {
        // decoy
        let j = 0;

        // start the looping at gap and end at length
        for (let i = gap; i < length; i++) {
            // store current dataSet value in temp
            const temp = dataSet[i];

            // j = i;
            let currentStr;
            if (i - gap >= 0) {
                currentStr = dataSet[i - gap][column].split('')[0].toLowerCase();
            } else {
                // in comparison will always return false hence skip the loop
                currentStr = 0;
            }
            for (j = i; j >= gap && currentStr > temp[column].split('')[0].toLowerCase(); j -= gap) {
                dataSet[j] = dataSet[j - gap];
            }

            // if condition is not met then no change in array
            dataSet[j] = temp;
        }

        gap = Math.floor(gap / 2);

    }
    // console.log('dataset', dataSet);
    return dataSet;
}

export function shellSortDesc(dataSet: any[], column: string) {
    let i, temp, flag = 1;
    const numLength = dataSet.length;
    let d = numLength;
    while (flag || (d > 1)) { // boolean flag (true when not equal to 0)
        flag = 0;           // reset flag to 0 to check for future swaps
        d = Math.floor((d + 1) / 2);
        for (i = 0; i < (numLength - d); i++) {
            if (dataSet[i + d][column].split('')[0].toLowerCase() > dataSet[i][column].split('')[0].toLowerCase()) {
                temp = dataSet[i + d];      // swap positions i+d and i
                dataSet[i + d] = dataSet[i];
                dataSet[i] = temp;
                flag = 1;                  // tells swap has occurred
            }
        }
    }
    return dataSet;
}
