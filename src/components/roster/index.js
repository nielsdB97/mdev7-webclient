import { h, Component } from 'preact';
import style from './style.less';

const isInArray = (value, array) => array.includes(value);

const neededDataPieces = [
	'checkIn',
	'activity',
	'start',
	'departure',
	'arrival',
	'end',
	'checkOut'
];

function RosterItem({ item }) {
	return (
		<tr class={style.rosteritem}>
			{Object.keys(item).map(dataPiece => isInArray(dataPiece, neededDataPieces) ? <td>{item[dataPiece]}</td> : null)}
		</tr>
	);
}

export default class Roster extends Component {
	render({ data }) {
		return data.length > 0
			? (
				<table class={style.rosterTable}>
					<thead class={style.rosteritem}>{Object.keys(data[0]).map(dataPiece => isInArray(dataPiece, neededDataPieces) ? <td class={style.rosterItemHeader}>{dataPiece}</td> : null)}</thead>
					<tbody>
						{data.map(item => <RosterItem item={item} />)}
					</tbody>
				</table>
			)
			: (
				<div>
					<h1>No roster items available.</h1>
				</div>
			);
	}
}
