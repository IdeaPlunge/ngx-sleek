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
