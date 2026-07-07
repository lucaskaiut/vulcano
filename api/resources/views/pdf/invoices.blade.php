<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Notas Fiscais</title>
<style>body{font-family:sans-serif;font-size:12px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}th{background:#f5f5f5;font-weight:600}h1{font-size:18px;margin-bottom:16px}</style>
</head>
<body>
<h1>Relatório de Notas Fiscais</h1>
<table>
<thead><tr>@foreach(($headers ?? ['Colaborador','Competência','Nº Nota','Valor','Emissão','Status']) as $h)<th>{{$h}}</th>@endforeach</tr></thead>
<tbody>
@foreach($rows as $i)
<tr>
@foreach(($headers ?? ['Colaborador','Competência','Nº Nota','Valor','Emissão','Status']) as $h)
@if($h === 'Colaborador')<td>{{$i->user->name}}</td>
@elseif($h === 'Competência')<td>{{$i->competence}}</td>
@elseif($h === 'Nº Nota')<td>{{$i->invoice_number}}</td>
@elseif($h === 'Valor')<td>R$ {{number_format((float)$i->amount,2,',','.')}}</td>
@elseif($h === 'Emissão')<td>{{$i->issue_date->format('d/m/Y')}}</td>
@elseif($h === 'Status')<td>{{$i->status}}</td>
@endif
@endforeach
</tr>
@endforeach
</tbody>
</table>
<p style="margin-top:20px;color:#999">Gerado em {{now()->format('d/m/Y H:i')}}</p>
</body>
</html>
